Feature: Course Bookmarking

  Scenario: Bookmarking a course adds it to user's list
    Given the user is logged in
    When they bookmark a course
    Then it should appear in their bookmarks page

  Scenario: Bookmark count increases after bookmarking
    Given a course has 2 bookmarks
    When another user bookmarks it
    Then the course should show 3 bookmarks

  Scenario: User cannot bookmark the same course twice
    Given the user already bookmarked the course
    When they try again
    Then the system should show "already bookmarked"

  Scenario: Removing bookmark deletes it from user's list
    Given the user bookmarked a course
    When they remove it
    Then it should disappear from their bookmarks

  Scenario: User cannot remove another user's bookmark
    Given User A created a bookmark
    When User B tries to remove it
    Then the system should deny the action

  Scenario: Bookmarked courses are sorted at top
    Given the user bookmarked a course
    When they open course listings
    Then the bookmarked courses should appear first

  Scenario: Guest cannot bookmark courses
    Given a user is not logged in
    When they try to bookmark
    Then the system should prompt for login
