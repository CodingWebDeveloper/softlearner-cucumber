Feature: Course Reviews

  Scenario: User reviews a purchased course with valid input
    Given the user purchased the course and has active status
    And the user writes a review of "Great course!"
    When they submit a review with rating 5 and text
    Then the review should be saved

  Scenario: Review fails with rating above 5
    Given the user submits a rating of 6
    Then the create review system should show "invalid rating"

  Scenario: Review fails with rating below 1
    Given the user submits a rating of 0
    Then the system should reject it

  Scenario: Review fails with empty fields
    Given the user leaves the review text empty
    Then the create review system should show "review text required"

  Scenario: Long text review is accepted
    Given the user purchased the course and has active status
    And the user writes a review of 1000 characters
    When they submit a review with rating 4 and text
    Then the review should be saved successfully

  Scenario: Review fails if course not purchased
    Given the user did not buy the course
    When they submit a review
    Then the system should reject it

  Scenario: Only one review per user per course
    Given the user already reviewed the course
    When they try to submit another
    Then the create review system should show "review already exists"
