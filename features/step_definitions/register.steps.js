const { Given, When, Then } = require("@cucumber/cucumber");
const { expect } = require("chai");

let registeredUsers = [];
let registrationResponse;
let confirmationTimestamp;
let currentUser = {};

const isValidPassword = (password) => {
  // At least 8 characters, one uppercase letter, one number, allow any chars
  return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
};

// ---------------------
// Helper function for submitting registration
// ---------------------

function submitRegistration() {
  const existing = registeredUsers.find((u) => u.email === currentUser.email);

  if (currentUser.role === "Admin") {
    registrationResponse = {
      success: false,
      message: "unauthorized role",
    };
    return;
  }

  if (existing) {
    registrationResponse = {
      success: false,
      message: "email already in use",
    };
    return;
  }

  if (!isValidPassword(currentUser.password)) {
    registrationResponse = {
      success: false,
      message: "password format invalid",
    };
    return;
  }

  if (currentUser.password !== currentUser.confirmPassword) {
    registrationResponse = {
      success: false,
      message: "passwords do not match",
    };
    return;
  }

  registrationResponse = {
    success: true,
    message: "confirmation email sent",
  };
  registeredUsers.push({
    email: currentUser.email,
    password: currentUser.password,
    confirmed: false,
    timestamp: Date.now(),
  });
}

// ---------------------
// Step Definitions
// ---------------------

Given("a new user with email {string} and valid password", function (email) {
  currentUser = {
    email,
    password: "Valid123!", // Note: now allowed by updated regex
    confirmPassword: "Valid123!",
    role: "Student",
  };
});

Given("a user with email {string} already exists", function (email) {
  registeredUsers.push({ email, password: "Valid123!", confirmed: true });
});

Given(
  "a new user enters a password not matching the security regex",
  function () {
    currentUser = {
      email: "badpass@example.com",
      password: "abc",
      confirmPassword: "abc",
      role: "Student",
    };
  }
);

Given("a new user enters mismatching passwords", function () {
  currentUser = {
    email: "mismatch@example.com",
    password: "Valid123!",
    confirmPassword: "Mismatch456!",
    role: "Student",
  };
});

Given("a user registered but did not confirm immediately", function () {
  currentUser = {
    email: "lazyconfirm@example.com",
    password: "Valid123!",
    confirmPassword: "Valid123!",
    role: "Student",
  };
  registeredUsers.push({
    email: currentUser.email,
    password: currentUser.password,
    confirmed: false,
    timestamp: Date.now(),
  });
  confirmationTimestamp = Date.now(); // Simulated registration time
});

Given("a user registered but did not confirm within 15 minutes", function () {
  const fifteenMinutesAgo = Date.now() - 16 * 60 * 1000;
  currentUser = {
    email: "expired@example.com",
    password: "Valid123!",
    confirmPassword: "Valid123!",
    role: "Student",
  };
  registeredUsers.push({
    email: currentUser.email,
    password: currentUser.password,
    confirmed: false,
    timestamp: fifteenMinutesAgo,
  });
});

Given('a user selects "Admin" as role during registration', function () {
  currentUser = {
    email: "admin@public.com",
    password: "Valid123!",
    confirmPassword: "Valid123!",
    role: "Admin",
  };
});

When("the user submits the registration form", function () {
  submitRegistration();
});

When("the user confirms email within 15 minutes", function () {
  const user = registeredUsers.find((u) => u.email === currentUser.email);
  const now = Date.now();
  const timeElapsed = now - user.timestamp;

  if (timeElapsed <= 15 * 60 * 1000) {
    user.confirmed = true;
    registrationResponse = { success: true, message: "account activated" };
  } else {
    registrationResponse = { success: false, message: "confirmation expired" };
  }
});

When("the user tries to log in", function () {
  const user = registeredUsers.find((u) => u.email === currentUser.email);
  if (!user.confirmed) {
    registrationResponse = { success: false, message: "email not verified" };
  } else {
    registrationResponse = { success: true };
  }
});

When("the form is submitted", function () {
  submitRegistration();
});

// ---------------------
// Then steps
// ---------------------

Then("the system should send a confirmation email", function () {
  expect(registrationResponse.success).to.be.true;
  expect(registrationResponse.message).to.equal("confirmation email sent");
});

Then("the system should display an {string} error", function (message) {
  expect(registrationResponse.success).to.be.false;
  expect(registrationResponse.message).to.equal(message);
});

Then("the register system should show a {string} error", function (message) {
  expect(registrationResponse.success).to.be.false;
  expect(registrationResponse.message).to.equal(message);
});

Then("the account should be activated", function () {
  expect(registrationResponse.success).to.be.true;
  expect(registrationResponse.message).to.equal("account activated");
});

Then("the register system should show an {string} message", function (message) {
  expect(registrationResponse.success).to.be.false;
  expect(registrationResponse.message).to.equal(message);
});

Then(
  "the system should reject the registration with {string} error",
  function (message) {
    expect(registrationResponse.success).to.be.false;
    expect(registrationResponse.message).to.equal(message);
  }
);

// ---------------------
// Missing step definitions to fix undefined errors
// ---------------------

When("a new user tries to register with the same email", function () {
  submitRegistration();
});

Then("the system should display a {string} error", function (message) {
  expect(registrationResponse.success).to.be.false;
  expect(registrationResponse.message).to.equal(message);
});
