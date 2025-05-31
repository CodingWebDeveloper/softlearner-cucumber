Feature: Browse Courses

  Scenario: Admin sees all courses including unpublished ones
    Given an Admin is logged in
    When they open the courses page
    Then they should see all published and unpublished courses

  Scenario: Educator sees only their own courses
    Given an Educator is logged in
    When they view the course list
    Then they should see only their own created courses

  Scenario: Student sees only published courses
    Given a Student is logged in
    When they view available courses
    Then they should see only courses with published status

  Scenario: Search returns matching course titles
    Given the user enters "JavaScript" in the search box
    When they search
    Then only courses with "JavaScript" in the title should appear

  Scenario: Filter returns courses by category
    Given the user selects a category filter "Web Development"
    When the filter is applied
    Then only courses from "Web Development" should be listed

  Scenario: Paginated results display correct number per page
    Given a Student is logged in
    And there are 35 available courses
    When the user views page 1 with 10 items per page
    Then 10 courses should be displayed


  Scenario: Pagination returns correct next set of courses
    Given a Student is logged in
    And there are more than 20 courses
    When the user navigates to page 2
    Then they should see the next 10 courses

  Scenario: Pagination shows no results on out-of-range page
    Given there are 15 courses
    When the user tries to view page 5 with 10 items per page
    Then the system should return an empty course list

  Scenario: Bookmarked courses appear first in listings
    Given a Student is logged in
    And there are 10 courses
    And the user has bookmarked 2 courses
    When they view the course list
    Then the bookmarked courses should appear at the top

