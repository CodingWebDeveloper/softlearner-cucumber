const { Given, When, Then, Before } = require("@cucumber/cucumber");
const { expect } = require("chai");

let user = null;
let course = null;
let submittedReview = null;
let reviewError = null;

// Simulated DB storage
const reviewsDB = [];

// Helper to find review by user & course
function findReview(userEmail, courseId) {
  return reviewsDB.find(
    (r) => r.userEmail === userEmail && r.courseId === courseId
  );
}

function reset() {
  user = null;
  course = null;
  submittedReview = null;
  reviewError = null;
}

// Clear DB and reset context before each scenario
Before(function () {
  reviewsDB.length = 0;
  reset();
});

Given("the user purchased the course and has active status", function () {
  user = { email: "user@example.com" };
  course = { id: "course-1", purchasedBy: [user.email], status: "active" };
  submittedReview = null;
  reviewError = null;
});

Given("the user writes a review of {string}", function (reviewText) {
  submittedReview = { rating: 5, text: reviewText };
});

Given("the user writes a review of 1000 characters", function () {
  const longText = "a".repeat(1000);
  submittedReview = { rating: 4, text: longText };
});

Given("the user submits a rating of {int}", function (rating) {
  user = { email: "user@example.com" };
  course = { id: "course-1", purchasedBy: [user.email], status: "active" };
  submittedReview = { rating, text: "Sample review" };

  if (rating > 5 || rating < 1) {
    reviewError = "invalid rating";
  }
});

Given("the user leaves the review text empty", function () {
  user = { email: "user@example.com" };
  course = { id: "course-1", purchasedBy: [user.email], status: "active" };
  submittedReview = { rating: 4, text: "" };
  if (!submittedReview.text || submittedReview.text.trim() === "") {
    reviewError = "review text required";
  }
});

Given("the user did not buy the course", function () {
  user = { email: "user@example.com" };
  course = { id: "course-1", purchasedBy: [], status: "inactive" };
  submittedReview = null;
});

Given("the user already reviewed the course", function () {
  user = { email: "user@example.com" };
  course = { id: "course-1", purchasedBy: [user.email], status: "active" };
  reviewsDB.push({
    userEmail: user.email,
    courseId: course.id,
    rating: 5,
    text: "Good course",
  });
});

When("they submit a review with rating {int} and text", function (rating) {
  // Check purchase
  if (!course.purchasedBy.includes(user.email) || course.status !== "active") {
    reviewError = "not purchased";
    return;
  }
  // Validate rating boundaries
  if (rating > 5 || rating < 1) {
    reviewError = "invalid rating";
    return;
  }
  if (
    !submittedReview ||
    !submittedReview.text ||
    submittedReview.text.trim() === ""
  ) {
    reviewError = "review text required";
    return;
  }
  // Check for existing review
  if (findReview(user.email, course.id)) {
    reviewError = "review already exists";
    return;
  }
  // Save review
  reviewsDB.push({
    userEmail: user.email,
    courseId: course.id,
    rating,
    text: submittedReview.text,
  });
  reviewError = null;
});

When("they submit a review", function () {
  // Check purchase
  if (!course.purchasedBy.includes(user.email) || course.status !== "active") {
    reviewError = "not purchased";
    return;
  }
  if (!submittedReview) {
    reviewError = "review text required";
    return;
  }
  if (submittedReview.rating > 5 || submittedReview.rating < 1) {
    reviewError = "invalid rating";
    return;
  }
  if (!submittedReview.text || submittedReview.text.trim() === "") {
    reviewError = "review text required";
    return;
  }
  if (findReview(user.email, course.id)) {
    reviewError = "review already exists";
    return;
  }
  // Save review
  reviewsDB.push({
    userEmail: user.email,
    courseId: course.id,
    rating: submittedReview.rating,
    text: submittedReview.text,
  });
  reviewError = null;
});

When("they try to submit another", function () {
  if (findReview(user.email, course.id)) {
    reviewError = "review already exists";
  } else {
    reviewError = null;
  }
});

Then("the review should be saved", function () {
  expect(reviewError).to.be.null;
  const review = findReview(user.email, course.id);
  expect(review).to.exist;
  expect(review.rating).to.be.within(1, 5);
  expect(review.text).to.not.be.empty;
});

Then("the create review system should show {string}", function (msg) {
  expect(reviewError).to.equal(msg);
});

Then("the system should reject it", function () {
  expect(reviewError).to.be.oneOf([
    "invalid rating",
    "review text required",
    "not purchased",
  ]);
});

Then("the review should be saved successfully", function () {
  expect(reviewError).to.be.null;
  const review = findReview(user.email, course.id);
  expect(review).to.exist;
  expect(review.text.length).to.equal(submittedReview.text.length);
});
