// features/step_definitions/browseCourses.steps.js
const { Given, When, Then } = require("@cucumber/cucumber");
const assert = require("assert");

let user = null;
let allCourses = [];
let visibleCourses = [];
let searchResults = [];
let bookmarkedCourses = [];
let currentPage = 1;
let itemsPerPage = 10;

function createCourses(
  num,
  {
    published = true,
    createdBy = null,
    category = "General",
    isPublic = true,
  } = {}
) {
  allCourses = [];
  for (let i = 1; i <= num; i++) {
    allCourses.push({
      id: i,
      title: `Course ${i}`,
      published: published,
      createdBy: createdBy,
      category: category,
      isPublic: isPublic,
    });
  }
}

Given("an Admin is logged in", function () {
  user = { role: "Admin" };
});

Given("a Student is logged in", function () {
  user = { role: "Student", id: 1 };
});

Given("an Educator is logged in", function () {
  user = { role: "Educator", id: 2 };
});

Given("a guest is not logged in", function () {
  user = null;
});

Given("there are {int} courses", function (count) {
  createCourses(count);
});

Given("there are {int} available courses", function (count) {
  createCourses(count, { published: true });
});

Given("there are more than {int} courses", function (count) {
  createCourses(count + 5);
});

Given("the user has bookmarked {int} courses", function (count) {
  if (!user) throw new Error("User must be logged in before bookmarking");
  bookmarkedCourses = allCourses.slice(0, count);
});

Given("the user selects a category filter {string}", function (category) {
  this.selectedCategory = category;
});

Given("the user enters {string} in the search box", function (term) {
  this.searchTerm = term.toLowerCase();
});

When("they open the courses page", function () {
  if (user?.role === "Admin") {
    visibleCourses = allCourses;
  } else if (user?.role === "Educator") {
    visibleCourses = allCourses.filter(
      (course) => course.createdBy === user.id
    );
  } else if (user?.role === "Student") {
    visibleCourses = allCourses.filter((course) => course.published);
  } else {
    visibleCourses = allCourses.filter((course) => course.isPublic);
  }
});

When("they view the course list", function () {
  if (bookmarkedCourses.length > 0) {
    visibleCourses = [
      ...bookmarkedCourses,
      ...allCourses.filter((c) => !bookmarkedCourses.includes(c)),
    ];
  } else {
    visibleCourses = allCourses;
  }
});

When("they view available courses", function () {
  visibleCourses = allCourses.filter((course) => course.published);
});

When("the filter is applied", function () {
  visibleCourses = allCourses.filter(
    (course) => course.category === this.selectedCategory
  );
});

When("they search", function () {
  searchResults = allCourses.filter((course) =>
    course.title.toLowerCase().includes(this.searchTerm)
  );
});

When(
  "the user views page {int} with {int} items per page",
  function (page, perPage) {
    currentPage = page;
    itemsPerPage = perPage;
    const start = (currentPage - 1) * itemsPerPage;
    visibleCourses = allCourses.slice(start, start + perPage);
  }
);

When("the user navigates to page 2", function () {
  currentPage = 2;
  itemsPerPage = 10;
  const start = (currentPage - 1) * itemsPerPage;
  visibleCourses = allCourses.slice(start, start + itemsPerPage);
});

When(
  "the user tries to view page {int} with {int} items per page",
  function (page, perPage) {
    const start = (page - 1) * perPage;
    visibleCourses = allCourses.slice(start, start + perPage);
  }
);

Then("they should see all published and unpublished courses", function () {
  assert.strictEqual(visibleCourses.length, allCourses.length);
});

Then("they should see only their own created courses", function () {
  assert.ok(visibleCourses.every((course) => course.createdBy === user.id));
});

Then("they should see only courses with published status", function () {
  assert.ok(visibleCourses.every((course) => course.published));
});

Then("only courses marked as {string} should be shown", function (status) {
  if (status === "public") {
    assert.ok(visibleCourses.every((course) => course.isPublic));
  }
});

Then("only courses with {string} in the title should appear", function (title) {
  assert.ok(searchResults.every((course) => course.title.includes(title)));
});

Then("only courses from {string} should be listed", function (category) {
  assert.ok(visibleCourses.every((course) => course.category === category));
});

Then("{int} courses should be displayed", function (expected) {
  assert.strictEqual(visibleCourses.length, expected);
});

Then("they should see the next {int} courses", function (expected) {
  assert.strictEqual(visibleCourses.length, expected);
});

Then("the bookmarked courses should appear at the top", function () {
  for (let i = 0; i < bookmarkedCourses.length; i++) {
    assert.strictEqual(visibleCourses[i].id, bookmarkedCourses[i].id);
  }
});

Then("the system should return an empty course list", function () {
  assert.strictEqual(visibleCourses.length, 0);
});
