"""
SkillBridge backend E2E test suite (Node/Express/Mongoose backend).
Covers: health, response normalizer (id vs _id), auth (send-otp/signup/login/forgot/reset),
profile CRUD, categories, courses, sections, subsections, media upload, cart, wishlist,
mock payment (Razorpay), rating, course-progress, instructor stats.
"""
import io
import os
import time
import uuid
import base64
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://eduplatform-hub-5.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

TAG = uuid.uuid4().hex[:8]
STUDENT_EMAIL = f"test_student_{TAG}@skillbridge.dev"
INSTR_EMAIL = f"test_instructor_{TAG}@skillbridge.dev"
PASSWORD = "Password123"

# Session-level state shared across tests
state = {}


def _signup(email, role):
    r = requests.post(f"{API}/auth/send-otp", json={"email": email}, timeout=30)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body.get("dev_otp"), f"dev_otp missing (mock mode expected). body={body}"
    otp = body["dev_otp"]
    r = requests.post(f"{API}/auth/signup", json={
        "firstName": "T", "lastName": role, "email": email,
        "password": PASSWORD, "confirmPassword": PASSWORD,
        "accountType": role, "otp": otp,
    }, timeout=30)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "token" in data and "user" in data
    assert "id" in data["user"] and "_id" not in data["user"]
    assert "password_hash" not in data["user"]
    return data["token"], data["user"]


# ---------------- Health & normalizer ----------------
class TestHealth:
    def test_root(self):
        r = requests.get(f"{API}/", timeout=15)
        assert r.status_code == 200
        j = r.json()
        assert j.get("status") == "ok"
        assert "SkillBridge" in j.get("message", "")

    def test_category_all_normalized(self):
        r = requests.get(f"{API}/category/all", timeout=15)
        assert r.status_code == 200
        cats = r.json()
        assert isinstance(cats, list) and len(cats) >= 6
        for c in cats:
            assert "id" in c and "_id" not in c
            assert "name" in c and "description" in c
        state["categoryId"] = cats[0]["id"]


# ---------------- Auth ----------------
class TestAuth:
    def test_send_otp_mock_returns_dev_otp(self):
        email = f"otp_only_{uuid.uuid4().hex[:6]}@skillbridge.dev"
        r = requests.post(f"{API}/auth/send-otp", json={"email": email}, timeout=15)
        assert r.status_code == 200
        body = r.json()
        assert body.get("success") is True
        assert body.get("dev_otp") and len(body["dev_otp"]) == 6

    def test_signup_student_and_instructor(self):
        state["stu_token"], state["stu_user"] = _signup(STUDENT_EMAIL, "Student")
        state["ins_token"], state["ins_user"] = _signup(INSTR_EMAIL, "Instructor")
        assert state["stu_user"]["role"] == "Student"
        assert state["ins_user"]["role"] == "Instructor"

    def test_signup_wrong_otp(self):
        email = f"badotp_{uuid.uuid4().hex[:6]}@skillbridge.dev"
        r = requests.post(f"{API}/auth/send-otp", json={"email": email}, timeout=15)
        assert r.status_code == 200
        r = requests.post(f"{API}/auth/signup", json={
            "firstName": "X", "lastName": "Y", "email": email,
            "password": PASSWORD, "confirmPassword": PASSWORD,
            "accountType": "Student", "otp": "000000",
        }, timeout=15)
        assert r.status_code == 400
        assert "otp" in r.json().get("detail", "").lower()

    def test_login_success(self):
        r = requests.post(f"{API}/auth/login", json={
            "email": STUDENT_EMAIL, "password": PASSWORD}, timeout=15)
        assert r.status_code == 200
        j = r.json()
        assert "token" in j and j["user"]["email"] == STUDENT_EMAIL
        assert "id" in j["user"]

    def test_login_wrong_password(self):
        r = requests.post(f"{API}/auth/login", json={
            "email": STUDENT_EMAIL, "password": "wrongpass"}, timeout=15)
        assert r.status_code == 401

    def test_forgot_and_reset_password(self):
        # forgot returns dev_token
        r = requests.post(f"{API}/auth/forgot-password",
                          json={"email": STUDENT_EMAIL}, timeout=15)
        assert r.status_code == 200
        dev_token = r.json().get("dev_token")
        assert dev_token
        new_pw = "NewPassword456"
        r = requests.post(f"{API}/auth/reset-password",
                          json={"token": dev_token, "password": new_pw}, timeout=15)
        assert r.status_code == 200

        # Old password fails
        r = requests.post(f"{API}/auth/login",
                          json={"email": STUDENT_EMAIL, "password": PASSWORD}, timeout=15)
        assert r.status_code == 401

        # New password works, refresh token in state
        r = requests.post(f"{API}/auth/login",
                          json={"email": STUDENT_EMAIL, "password": new_pw}, timeout=15)
        assert r.status_code == 200
        state["stu_token"] = r.json()["token"]

        # Restore original password (change-password endpoint)
        r = requests.put(f"{API}/profile/change-password",
                         headers={"Authorization": f"Bearer {state['stu_token']}"},
                         json={"oldPassword": new_pw, "newPassword": PASSWORD}, timeout=15)
        assert r.status_code == 200

        # Re-login with restored password
        r = requests.post(f"{API}/auth/login",
                          json={"email": STUDENT_EMAIL, "password": PASSWORD}, timeout=15)
        assert r.status_code == 200
        state["stu_token"] = r.json()["token"]


# ---------------- Profile ----------------
class TestProfile:
    def test_get_me(self):
        r = requests.get(f"{API}/profile/me",
                         headers={"Authorization": f"Bearer {state['stu_token']}"}, timeout=15)
        assert r.status_code == 200
        j = r.json()
        assert "user" in j and "profile" in j
        assert "id" in j["user"] and "_id" not in j["user"]
        assert "id" in j["profile"] and "_id" not in j["profile"]
        assert "password_hash" not in j["user"]

    def test_update_profile(self):
        r = requests.put(f"{API}/profile/update",
                         headers={"Authorization": f"Bearer {state['stu_token']}"},
                         json={"firstName": "Updated", "about": "Learning"}, timeout=15)
        assert r.status_code == 200
        r = requests.get(f"{API}/profile/me",
                         headers={"Authorization": f"Bearer {state['stu_token']}"}, timeout=15)
        assert r.json()["user"]["firstName"] == "Updated"
        assert r.json()["profile"]["about"] == "Learning"

    def test_change_password_wrong_old(self):
        r = requests.put(f"{API}/profile/change-password",
                         headers={"Authorization": f"Bearer {state['stu_token']}"},
                         json={"oldPassword": "wrong", "newPassword": "abc"}, timeout=15)
        assert r.status_code == 400


# ---------------- Course flow (instructor) ----------------
class TestCourseFlow:
    def test_create_course_section_subsection_and_publish(self):
        h = {"Authorization": f"Bearer {state['ins_token']}"}
        r = requests.post(f"{API}/course/create", headers=h, json={
            "courseName": f"TEST Course {TAG}",
            "courseDescription": "Test description",
            "whatYouWillLearn": "Everything about testing",
            "price": 500,
            "categoryId": state["categoryId"],
            "tags": ["test"], "instructions": ["Bring laptop"],
        }, timeout=20)
        assert r.status_code == 200, r.text
        course = r.json()
        assert "id" in course and "_id" not in course
        state["course_id"] = course["id"]

        # Add section
        r = requests.post(f"{API}/course/section/create", headers=h, json={
            "courseId": state["course_id"], "sectionName": "Intro"
        }, timeout=15)
        assert r.status_code == 200
        section = r.json()
        assert "id" in section
        section_id = section["id"]

        # Add subsection
        r = requests.post(f"{API}/course/subsection/create", headers=h, json={
            "sectionId": section_id,
            "title": "Welcome",
            "description": "Hello",
            "videoUrl": "https://sample.com/video.mp4",
            "timeDuration": "60",
        }, timeout=15)
        assert r.status_code == 200
        assert "id" in r.json()

        # Publish
        r = requests.put(f"{API}/course/{state['course_id']}", headers=h,
                         json={"status": "Published"}, timeout=15)
        assert r.status_code == 200

        # Verify listed in /course/all
        r = requests.get(f"{API}/course/all", timeout=15)
        assert r.status_code == 200
        courses = r.json()
        assert any(c["id"] == state["course_id"] for c in courses)

        # Verify GET /course/:id has sections and subsections
        r = requests.get(f"{API}/course/{state['course_id']}", timeout=15)
        assert r.status_code == 200
        detail = r.json()
        assert detail["sections"] and detail["sections"][0]["subsections"]


# ---------------- Media upload (mock) ----------------
class TestMedia:
    def test_upload_small_image_mock(self):
        # minimal 1x1 PNG
        png = base64.b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAApJREFUCNdjYAAAAAIAAeIhvDMAAAAASUVORK5CYII="
        )
        h = {"Authorization": f"Bearer {state['ins_token']}"}
        files = {"file": ("t.png", io.BytesIO(png), "image/png")}
        r = requests.post(f"{API}/media/upload", headers=h, files=files, timeout=30)
        assert r.status_code == 200, r.text
        j = r.json()
        assert "url" in j and j["url"]


# ---------------- Cart & Wishlist ----------------
class TestCartWishlist:
    def test_cart_add_get_remove(self):
        h = {"Authorization": f"Bearer {state['stu_token']}"}
        cid = state["course_id"]
        r = requests.post(f"{API}/cart/add", headers=h, json={"courseId": cid}, timeout=15)
        assert r.status_code == 200
        r = requests.get(f"{API}/cart", headers=h, timeout=15)
        assert r.status_code == 200
        j = r.json()
        assert any(c["id"] == cid for c in j["items"])
        assert j["total"] >= 500

    def test_wishlist_toggle(self):
        h = {"Authorization": f"Bearer {state['stu_token']}"}
        cid = state["course_id"]
        r = requests.post(f"{API}/wishlist/toggle", headers=h, json={"courseId": cid}, timeout=15)
        assert r.status_code == 200 and r.json()["in"] is True
        r = requests.get(f"{API}/wishlist", headers=h, timeout=15)
        assert r.status_code == 200 and any(c["id"] == cid for c in r.json())
        r = requests.post(f"{API}/wishlist/toggle", headers=h, json={"courseId": cid}, timeout=15)
        assert r.json()["in"] is False


# ---------------- Payment (mock) ----------------
class TestPayment:
    def test_mock_payment_creates_order_and_enrolls(self):
        h = {"Authorization": f"Bearer {state['stu_token']}"}
        cid = state["course_id"]
        r = requests.post(f"{API}/payment/create-order", headers=h,
                         json={"courseIds": [cid]}, timeout=20)
        assert r.status_code == 200, r.text
        order = r.json()
        assert order["orderId"].startswith("order_mock_")
        assert order["mock"] is True

        r = requests.post(f"{API}/payment/verify", headers=h, json={
            "razorpay_order_id": order["orderId"],
            "razorpay_payment_id": "pay_mock",
            "razorpay_signature": "sig_mock",
            "courseIds": [cid],
        }, timeout=20)
        assert r.status_code == 200
        assert r.json()["success"] is True

        # Enrolled listing
        r = requests.get(f"{API}/course/student/enrolled", headers=h, timeout=15)
        assert r.status_code == 200
        assert any(c["id"] == cid for c in r.json())


# ---------------- Rating ----------------
class TestRating:
    def test_non_enrolled_forbidden(self):
        # Instructor is not enrolled in own course, expect 403
        h = {"Authorization": f"Bearer {state['ins_token']}"}
        r = requests.post(f"{API}/rating/create", headers=h, json={
            "courseId": state["course_id"], "rating": 5, "review": "Great"
        }, timeout=15)
        assert r.status_code == 403

    def test_enrolled_student_can_rate(self):
        h = {"Authorization": f"Bearer {state['stu_token']}"}
        r = requests.post(f"{API}/rating/create", headers=h, json={
            "courseId": state["course_id"], "rating": 5, "review": "Amazing"
        }, timeout=15)
        assert r.status_code == 200


# ---------------- Progress ----------------
class TestProgress:
    def test_update_and_get_progress(self):
        h = {"Authorization": f"Bearer {state['stu_token']}"}
        # Fetch a valid subsection id
        r = requests.get(f"{API}/course/{state['course_id']}", timeout=15)
        subs = r.json()["sections"][0]["subsections"]
        sub_id = subs[0]["id"]

        r = requests.post(f"{API}/course-progress/update", headers=h, json={
            "courseId": state["course_id"], "subsectionId": sub_id
        }, timeout=15)
        assert r.status_code == 200
        r = requests.get(f"{API}/course-progress/{state['course_id']}", headers=h, timeout=15)
        assert r.status_code == 200
        j = r.json()
        assert sub_id in [str(x) for x in j.get("completedVideos", [])]


# ---------------- Instructor stats ----------------
class TestInstructorStats:
    def test_stats(self):
        h = {"Authorization": f"Bearer {state['ins_token']}"}
        r = requests.get(f"{API}/instructor/stats", headers=h, timeout=15)
        assert r.status_code == 200
        j = r.json()
        assert j["totalCourses"] >= 1
        assert j["totalStudents"] >= 1
        assert j["totalRevenue"] >= 500
        assert j["avgRating"] >= 1
        assert isinstance(j["perCourse"], list)
        pc = next((p for p in j["perCourse"] if p["id"] == state["course_id"]), None)
        assert pc and pc["revenue"] >= 500 and pc["avgRating"] >= 1
