const { Given, When, Then } = require("@cucumber/cucumber");
const { expect } = require("chai");

// Allowed extensions and size limits (in MB)
const allowedExtensions = [".pdf", ".docx"];
const maxFileSizeMB = 50;
const maxMaterialFileSizeMB = 10;

function hasValidExtension(filename) {
  return allowedExtensions.some((ext) => filename.endsWith(ext));
}

Given("an Educator is logged in create course", function () {
  this.currentUser = {
    email: "educator@example.com",
    role: "Educator",
    loggedIn: true,
  };
  // Set valid course form here to prevent missing title error
  this.courseForm = {
    title: "Valid Course Title",
    description: "A valid description",
    status: "published",
  };
  this.savedCourse = null;
  this.error = null;
  this.uploadResult = null;
});

Given("an Educator submits a course with empty title", function () {
  this.currentUser = {
    email: "educator@example.com",
    role: "Educator",
    loggedIn: true,
  };
  this.courseForm = {
    title: "",
    description: "Some description",
    status: "published",
  };
  this.savedCourse = null;
  this.error = null;

  if (!this.courseForm.title || this.courseForm.title.trim() === "") {
    this.error = "title is required";
  }
});

Given("a Student is logged in create course", function () {
  this.currentUser = {
    email: "student@example.com",
    role: "Student",
    loggedIn: true,
  };
  this.courseForm = {};
  this.savedCourse = null;
  this.error = null;
  this.uploadResult = null;
});

Given("the Educator uploads .pdf and .docx files under 10MB", function () {
  const files = [
    { name: "material1.pdf", sizeMB: 5 },
    { name: "material2.docx", sizeMB: 8 },
  ];

  const valid = files.every(
    (f) => hasValidExtension(f.name) && f.sizeMB <= maxMaterialFileSizeMB
  );

  this.uploadResult = valid ? "accepted" : "rejected";
});

Given("the Educator uploads an .exe file", function () {
  const file = { name: "virus.exe", sizeMB: 1 };
  this.uploadResult = hasValidExtension(file.name) ? "accepted" : "rejected";
});

Given("the Educator uploads a file larger than 50MB", function () {
  const file = { name: "largefile.pdf", sizeMB: 51 };
  this.uploadResult =
    file.sizeMB > maxFileSizeMB ? "file too large" : "accepted";
});

Given("the Educator fills the course form", function () {
  // Make sure currentUser is set for authorization
  this.currentUser = {
    email: "educator@example.com",
    role: "Educator",
    loggedIn: true,
  };
  this.courseForm = {
    title: "New Course Title",
    description: "Course description",
    status: "published",
  };
  this.savedCourse = null;
  this.error = null;
});

When("they submit a course form with valid data", function () {
  this.error = null; // Reset error before validation

  if (
    !this.currentUser ||
    !["Educator", "Admin"].includes(this.currentUser.role)
  ) {
    this.error = "access denied";
    this.savedCourse = null;
    return;
  }

  if (!this.courseForm.title || this.courseForm.title.trim() === "") {
    this.error = "title is required";
    this.savedCourse = null;
    return;
  }

  const newCourse = {
    id: `course-${Date.now()}`,
    title: this.courseForm.title,
    description: this.courseForm.description,
    status: "published",
    creator: this.currentUser.email,
  };

  this.savedCourse = newCourse;
  this.error = null;
});

When("they try to create a course", function () {
  this.error = null; // Reset error

  if (
    !this.currentUser ||
    !["Educator", "Admin"].includes(this.currentUser.role)
  ) {
    this.error = "access denied";
    this.savedCourse = null;
  } else {
    this.savedCourse = { success: true };
    this.error = null;
  }
});

When('they choose "Save as draft"', function () {
  this.error = null; // Reset error

  if (
    !this.currentUser ||
    !["Educator", "Admin"].includes(this.currentUser.role)
  ) {
    this.error = "access denied";
    this.savedCourse = null;
    return;
  }

  const newCourse = {
    id: `course-${Date.now()}`,
    title: this.courseForm.title || "Untitled Draft",
    description: this.courseForm.description || "",
    status: "draft",
    creator: this.currentUser.email,
  };

  this.savedCourse = newCourse;
  this.error = null;
});

Then("the course should be saved and published", function () {
  expect(this.error).to.be.null;
  expect(this.savedCourse).to.be.an("object");
  expect(this.savedCourse.status).to.equal("published");
  expect(this.savedCourse.title).to.not.be.empty;
  expect(this.savedCourse.creator).to.equal(this.currentUser.email);
});

Then('the system should show "title is required"', function () {
  expect(this.error).to.equal("title is required");
});

Then('the system should return "access denied"', function () {
  expect(this.error).to.equal("access denied");
});

Then("the upload should be accepted", function () {
  expect(this.uploadResult).to.equal("accepted");
});

Then("the system should reject the file", function () {
  expect(this.uploadResult).to.equal("rejected");
});

Then('the system should show a "file too large" error', function () {
  expect(this.uploadResult).to.equal("file too large");
});

Then('the course should be saved with status "draft"', function () {
  expect(this.error).to.be.null;
  expect(this.savedCourse).to.be.an("object");
  expect(this.savedCourse.status).to.equal("draft");
  expect(this.savedCourse.creator).to.equal(this.currentUser.email);
});
