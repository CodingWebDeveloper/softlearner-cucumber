const { Given, When, Then } = require("@cucumber/cucumber");
const { expect } = require("chai");

// State
let user = null;
let course = null;
let bookmarkError = null;

// Simulated DB
const bookmarksDB = [];
const coursesDB = [];

// Utility functions
function reset() {
  user = null;
  course = null;
  bookmarkError = null;
  bookmarksDB.length = 0;
  coursesDB.length = 0;
}

function countBookmarks(courseId) {
  return bookmarksDB.filter((bm) => bm.courseId === courseId).length;
}

function userHasBookmark(userEmail, courseId) {
  return bookmarksDB.some(
    (bm) => bm.userEmail === userEmail && bm.courseId === courseId
  );
}

// Steps

Given("the user is logged in", function () {
  reset();
  user = { email: "user@example.com", loggedIn: true };
  course = { id: "course-1" };
});

Given("a course has {int} bookmarks", function (count) {
  reset();
  course = { id: "course-1" };
  for (let i = 0; i < count; i++) {
    bookmarksDB.push({
      userEmail: `user${i}@example.com`,
      courseId: course.id,
    });
  }
});

Given("the user already bookmarked the course", function () {
  reset();
  user = { email: "user@example.com", loggedIn: true };
  course = { id: "course-1" };
  bookmarksDB.push({ userEmail: user.email, courseId: course.id });
});

Given("the user bookmarked a course", function () {
  reset();
  user = { email: "user@example.com", loggedIn: true };
  course = { id: "course-1" };
  bookmarksDB.push({ userEmail: user.email, courseId: course.id });
});

Given("User A created a bookmark", function () {
  reset();
  user = { email: "userA@example.com", loggedIn: true };
  course = { id: "course-1" };
  bookmarksDB.push({ userEmail: user.email, courseId: course.id });
});

Given("a user is not logged in", function () {
  reset();
  user = { loggedIn: false };
  course = { id: "course-1" };
});

When("they bookmark a course", function () {
  if (!user || !user.loggedIn) {
    bookmarkError = "login required";
    return;
  }
  if (!course) {
    bookmarkError = "course not found";
    return;
  }
  if (userHasBookmark(user.email, course.id)) {
    bookmarkError = "already bookmarked";
    return;
  }
  bookmarksDB.push({ userEmail: user.email, courseId: course.id });
});

When("another user bookmarks it", function () {
  const newUserEmail = "newuser@example.com";
  if (userHasBookmark(newUserEmail, course.id)) {
    bookmarkError = "already bookmarked";
    return;
  }
  bookmarksDB.push({ userEmail: newUserEmail, courseId: course.id });
});

When("they try again", function () {
  if (userHasBookmark(user.email, course.id)) {
    bookmarkError = "already bookmarked";
  }
});

When("they remove it", function () {
  if (!userHasBookmark(user.email, course.id)) {
    bookmarkError = "bookmark not found";
    return;
  }
  const index = bookmarksDB.findIndex(
    (bm) => bm.userEmail === user.email && bm.courseId === course.id
  );
  if (index !== -1) {
    bookmarksDB.splice(index, 1);
  }
});

When("User B tries to remove it", function () {
  const userB = { email: "userB@example.com", loggedIn: true };
  if (!userHasBookmark(user.email, course.id)) {
    bookmarkError = "bookmark not found";
    return;
  }
  if (userB.email !== user.email) {
    bookmarkError = "access denied";
  }
});

When("they open course listings", function () {
  const allCourses = [
    { id: course.id, title: "Bookmarked Course" },
    { id: "course-2", title: "Other Course 1" },
    { id: "course-3", title: "Other Course 2" },
  ];
  this.sortedCourses = allCourses.sort((a, b) => {
    const aBookmarked = userHasBookmark(user.email, a.id) ? 0 : 1;
    const bBookmarked = userHasBookmark(user.email, b.id) ? 0 : 1;
    return aBookmarked - bBookmarked;
  });
});

When("they try to bookmark", function () {
  if (!user || !user.loggedIn) {
    bookmarkError = "login required";
  }
});

Then("it should appear in their bookmarks page", function () {
  const hasBookmark = userHasBookmark(user.email, course.id);
  expect(hasBookmark).to.be.true;
  expect(bookmarkError).to.be.null;
});

Then("the course should show {int} bookmarks", function (expectedCount) {
  const count = countBookmarks(course.id);
  expect(count).to.equal(expectedCount);
});

Then('the system should show "already bookmarked"', function () {
  expect(bookmarkError).to.equal("already bookmarked");
});

Then("it should disappear from their bookmarks", function () {
  const hasBookmark = userHasBookmark(user.email, course.id);
  expect(hasBookmark).to.be.false;
});

Then("the system should deny the action", function () {
  expect(bookmarkError).to.equal("access denied");
});

Then("the bookmarked courses should appear first", function () {
  expect(this.sortedCourses).to.be.an("array");
  expect(this.sortedCourses[0].id).to.equal(course.id);
});

Then("the system should prompt for login", function () {
  expect(bookmarkError).to.equal("login required");
});
