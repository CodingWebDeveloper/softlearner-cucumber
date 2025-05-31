Feature: Course Creation

  Scenario: Educator creates a course with valid input
    Given an Educator is logged in create course
    When they submit a course form with valid data
    Then the course should be saved and published

  Scenario: Course creation fails with missing title
    Given an Educator submits a course with empty title
    Then the system should show "title is required"

  Scenario: Only Educator or Admin can create a course
    Given a Student is logged in create course
    When they try to create a course
    Then the system should return "access denied"

  Scenario: Uploading valid material files succeeds
    Given the Educator uploads .pdf and .docx files under 10MB
    Then the upload should be accepted

  Scenario: Uploading file with invalid extension fails
    Given the Educator uploads an .exe file
    Then the system should reject the file

  Scenario: Uploading file over size limit fails
    Given the Educator uploads a file larger than 50MB
    Then the system should show a "file too large" error

  Scenario: Saving course as draft
    Given the Educator fills the course form
    When they choose "Save as draft"
    Then the course should be saved with status "draft"
