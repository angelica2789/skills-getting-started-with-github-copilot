"""
Test suite for the FastAPI application
"""

from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_root_redirect():
    """Test that the root endpoint redirects to index.html"""
    response = client.get("/", follow_redirects=False)
    assert response.status_code == 307
    assert response.headers["location"] == "/static/index.html"

def test_get_activities():
    """Test getting the list of activities"""
    response = client.get("/activities")
    assert response.status_code == 200
    activities = response.json()
    assert isinstance(activities, dict)
    assert "Soccer Team" in activities
    assert "Basketball Team" in activities

def test_signup_for_activity_success():
    """Test successful signup for an activity"""
    email = "test@mergington.edu"
    activity = "Programming Class"
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 200
    result = response.json()
    assert result["message"] == f"Signed up {email} for {activity}"

def test_signup_for_activity_already_registered():
    """Test signup when student is already registered"""
    # First signup
    email = "duplicate@mergington.edu"
    activity = "Chess Club"
    client.post(f"/activities/{activity}/signup?email={email}")
    
    # Try to signup again
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 400
    result = response.json()
    assert "already signed up" in result["detail"]

def test_signup_for_nonexistent_activity():
    """Test signup for an activity that doesn't exist"""
    email = "test@mergington.edu"
    activity = "Nonexistent Club"
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 404
    result = response.json()
    assert "Activity not found" in result["detail"]

def test_remove_participant_success():
    """Test successfully removing a participant from an activity"""
    # First add a participant
    email = "remove@mergington.edu"
    activity = "Art Club"
    client.post(f"/activities/{activity}/signup?email={email}")
    
    # Then remove them
    response = client.delete(f"/activities/{activity}/participants/{email}")
    assert response.status_code == 200
    result = response.json()
    assert result["message"] == f"Removed {email} from {activity}"

def test_remove_nonexistent_participant():
    """Test removing a participant that isn't registered"""
    email = "nonexistent@mergington.edu"
    activity = "Drama Club"
    response = client.delete(f"/activities/{activity}/participants/{email}")
    assert response.status_code == 404
    result = response.json()
    assert "Participant not found" in result["detail"]

def test_remove_participant_from_nonexistent_activity():
    """Test removing a participant from an activity that doesn't exist"""
    email = "test@mergington.edu"
    activity = "Nonexistent Club"
    response = client.delete(f"/activities/{activity}/participants/{email}")
    assert response.status_code == 404
    result = response.json()
    assert "Activity not found" in result["detail"]
