Feature: User Registration

  Scenario: Successful registration with valid email and matching passwords
    Given a new user with email "new@example.com" and valid password
    When the user submits the registration form
    Then the system should send a confirmation email

  Scenario: Registration fails with existing email
    Given a user with email "existing@example.com" already exists
    When a new user tries to register with the same email
    Then the system should display an "email already in use" error

  Scenario: Registration fails with weak password
    Given a new user enters a password not matching the security regex
    When the user submits the registration form
    Then the system should display a "password format invalid" error

  Scenario: Registration fails when confirmation password does not match
    Given a new user enters mismatching passwords
    When the user submits the registration form
    Then the register system should show a "passwords do not match" error

  Scenario: Successful registration with delayed email confirmation within 15 minutes
    Given a user registered but did not confirm immediately
    When the user confirms email within 15 minutes
    Then the account should be activated

  Scenario: Registration fails if email not confirmed within 15 minutes
    Given a user registered but did not confirm within 15 minutes
    When the user tries to log in
    Then the register system should show an "email not verified" message

  Scenario: Registration blocked for Admin role via public form
    Given a user selects "Admin" as role during registration
    When the form is submitted
    Then the system should reject the registration with "unauthorized role" error
