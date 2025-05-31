Feature: Course Purchase

  Scenario: Successful course purchase by logged-in Student
    Given a Student is logged in buy course
    When they purchase a course
    Then the course status should be "active" for that user

  Scenario: Access to materials after successful purchase
    Given the Student has an active course
    When they access course content
    Then they should see all associated materials

  Scenario: Access to tests after purchase
    Given the Student has purchased the course
    When they open the tests section
    Then they should be able to start a test

  Scenario: Purchase fails with invalid payment method
    Given the Student tries to pay with an expired card
    When the purchase is submitted
    Then the system should return a "payment failed" message

  Scenario: Course purchase by Guest is denied
    Given the user is not logged in
    When they attempt to purchase a course
    Then the buy course system should prompt for login

  Scenario: User cannot purchase the same course twice
    Given the user already owns the course
    When they attempt to buy it again
    Then the system should return "already purchased" error

  Scenario: Purchase creates transaction log entry
    Given the Student purchases a course
    Then a purchase transaction record should be saved for auditing
