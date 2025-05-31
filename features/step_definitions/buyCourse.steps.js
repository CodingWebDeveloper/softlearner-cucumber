const { Given, When, Then } = require("@cucumber/cucumber");
const { expect } = require("chai");

let users = {};
let purchases = [];
let materials = {};
let tests = {};
let transactionLogs = [];
let purchaseResponse = {};
let currentUser = null;
let selectedCourse = "course-101";

// Utility
function findPurchase(userEmail, courseId) {
  return purchases.find((p) => p.user === userEmail && p.course === courseId);
}

function purchaseCourse() {
  if (!currentUser.loggedIn) {
    purchaseResponse = { success: false, message: "login required" };
    return;
  }

  if (findPurchase(currentUser.email, selectedCourse)) {
    purchaseResponse = { success: false, message: "already purchased" };
    return;
  }

  purchases.push({
    user: currentUser.email,
    course: selectedCourse,
    status: "active",
  });
  transactionLogs.push({
    user: currentUser.email,
    course: selectedCourse,
    timestamp: Date.now(),
  });

  purchaseResponse = { success: true };
}

// -----------------------------
// Step Definitions
// -----------------------------

// LOGIN SCENARIOS

Given("a Student is logged in buy course", function () {
  currentUser = {
    email: "student@example.com",
    role: "Student",
    loggedIn: true,
  };
  users[currentUser.email] = currentUser;
});

Given("the user is not logged in", function () {
  currentUser = { email: null, role: "Guest", loggedIn: false };
});

// PURCHASE SCENARIOS

When("they purchase a course", function () {
  purchaseCourse();
});

Then("the course status should be {string} for that user", function (status) {
  const purchase = findPurchase(currentUser.email, selectedCourse);
  expect(purchase).to.not.be.undefined;
  expect(purchase.status).to.equal(status);
});

// MATERIAL ACCESS

Given("the Student has an active course", function () {
  currentUser = {
    email: "student@example.com",
    role: "Student",
    loggedIn: true,
  };
  purchases.push({
    user: currentUser.email,
    course: selectedCourse,
    status: "active",
  });
  materials[selectedCourse] = ["intro.pdf", "lesson1.mp4"];
});

When("they access course content", function () {
  const purchase = findPurchase(currentUser.email, selectedCourse);
  if (purchase && purchase.status === "active") {
    purchaseResponse = { success: true, materials: materials[selectedCourse] };
  } else {
    purchaseResponse = { success: false, materials: [] };
  }
});

Then("they should see all associated materials", function () {
  expect(purchaseResponse.success).to.be.true;
  expect(purchaseResponse.materials).to.include("intro.pdf");
  expect(purchaseResponse.materials).to.include("lesson1.mp4");
});

// TEST ACCESS

Given("the Student has purchased the course", function () {
  currentUser = {
    email: "student@example.com",
    role: "Student",
    loggedIn: true,
  };
  purchases.push({
    user: currentUser.email,
    course: selectedCourse,
    status: "active",
  });
  tests[selectedCourse] = ["Quiz 1"];
});

When("they open the tests section", function () {
  const purchase = findPurchase(currentUser.email, selectedCourse);
  if (purchase && purchase.status === "active") {
    purchaseResponse = { success: true, tests: tests[selectedCourse] };
  } else {
    purchaseResponse = { success: false, tests: [] };
  }
});

Then("they should be able to start a test", function () {
  expect(purchaseResponse.success).to.be.true;
  expect(purchaseResponse.tests).to.include("Quiz 1");
});

// PAYMENT FAILURE

Given("the Student tries to pay with an expired card", function () {
  currentUser = {
    email: "student@example.com",
    role: "Student",
    loggedIn: true,
  };
  currentUser.paymentMethod = { type: "card", status: "expired" };
});

When("the purchase is submitted", function () {
  if (!currentUser.loggedIn) {
    purchaseResponse = { success: false, message: "login required" };
    return;
  }

  if (currentUser.paymentMethod?.status === "expired") {
    purchaseResponse = { success: false, message: "payment failed" };
    return;
  }

  if (findPurchase(currentUser.email, selectedCourse)) {
    purchaseResponse = { success: false, message: "already purchased" };
    return;
  }

  purchases.push({
    user: currentUser.email,
    course: selectedCourse,
    status: "active",
  });
  transactionLogs.push({
    user: currentUser.email,
    course: selectedCourse,
    timestamp: Date.now(),
  });
  purchaseResponse = { success: true };
});

Then("the system should return a {string} message", function (message) {
  expect(purchaseResponse.success).to.be.false;
  expect(purchaseResponse.message).to.equal(message);
});

// LOGIN REQUIRED

When("they attempt to purchase a course", function () {
  purchaseCourse();
});

Then("the buy course system should prompt for login", function () {
  expect(purchaseResponse.success).to.be.false;
  expect(purchaseResponse.message).to.equal("login required");
});

// DUPLICATE PURCHASE

Given("the user already owns the course", function () {
  currentUser = {
    email: "student@example.com",
    role: "Student",
    loggedIn: true,
  };
  purchases.push({
    user: currentUser.email,
    course: selectedCourse,
    status: "active",
  });
});

When("they attempt to buy it again", function () {
  purchaseCourse();
});

Then("the system should return {string} error", function (message) {
  expect(purchaseResponse.success).to.be.false;
  expect(purchaseResponse.message).to.equal(message);
});

// AUDIT LOGGING

Given("the Student purchases a course", function () {
  currentUser = {
    email: "student@example.com",
    role: "Student",
    loggedIn: true,
  };
  purchases.push({
    user: currentUser.email,
    course: selectedCourse,
    status: "active",
  });
  transactionLogs.push({
    user: currentUser.email,
    course: selectedCourse,
    timestamp: Date.now(),
  });
});

Then("a purchase transaction record should be saved for auditing", function () {
  const log = transactionLogs.find(
    (l) => l.user === currentUser.email && l.course === selectedCourse
  );
  expect(log).to.not.be.undefined;
});
