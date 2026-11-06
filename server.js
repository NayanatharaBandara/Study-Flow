const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");
const db = require("./db");

const app = express();
const PORT = 3000;


// =====================================================
// BASIC MIDDLEWARE
// =====================================================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true
  })
);


// =====================================================
// SESSION SETUP
// =====================================================

app.use(
  session({
    secret: "studyflow-development-secret-key",

    resave: false,

    saveUninitialized: false,

    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24
    }
  })
);


// =====================================================
// PAGE PROTECTION
// =====================================================

const protectedPages = [
  "/dashboard.html",
  "/tasks.html",
  "/assignments.html",
  "/exams.html",
  "/calendar.html",
  "/integrations.html",
  "/profile.html"
];


app.use((req, res, next) => {

  if (
    protectedPages.includes(req.path) &&
    !req.session.userId
  ) {
    return res.redirect("/login.html");
  }

  next();
});


// =====================================================
// STATIC FILES
// =====================================================

app.use(express.static(__dirname));


// =====================================================
// AUTH MIDDLEWARE
// =====================================================

function requireAuth(req, res, next) {

  if (!req.session.userId) {

    return res.status(401).json({
      message: "You must be logged in."
    });
  }

  next();
}


// =====================================================
// HOME
// =====================================================

app.get("/", (req, res) => {

  if (req.session.userId) {
    return res.redirect("/dashboard.html");
  }

  res.sendFile(
    path.join(
      __dirname,
      "login.html"
    )
  );
});


// =====================================================
// TEST
// =====================================================

app.get("/api/test", (req, res) => {

  res.json({
    message: "StudyFlow backend is working!"
  });
});


// =====================================================
// REGISTER
// =====================================================

app.post(
  "/api/register",
  async (req, res) => {

    try {

      const {
        name,
        email,
        password
      } = req.body;


      if (
        !name ||
        !email ||
        !password
      ) {

        return res.status(400).json({
          message: "All fields are required."
        });
      }


      db.query(
        `
        SELECT id
        FROM users
        WHERE email = ?
        `,
        [email],

        async (error, results) => {

          if (error) {

            console.error(error);

            return res.status(500).json({
              message: "Database error."
            });
          }


          if (results.length > 0) {

            return res.status(400).json({
              message: "Email is already registered."
            });
          }


          const hashedPassword =
            await bcrypt.hash(
              password,
              10
            );


          db.query(
            `
            INSERT INTO users
            (
              name,
              email,
              password
            )
            VALUES (?, ?, ?)
            `,
            [
              name,
              email,
              hashedPassword
            ],

            (error) => {

              if (error) {

                console.error(error);

                return res.status(500).json({
                  message:
                    "Could not create account."
                });
              }


              res.status(201).json({
                message:
                  "Account created successfully!"
              });
            }
          );
        }
      );

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message: "Server error."
      });
    }
  }
);


// =====================================================
// LOGIN
// =====================================================

app.post(
  "/api/login",
  (req, res) => {

    const {
      email,
      password
    } = req.body;


    if (
      !email ||
      !password
    ) {

      return res.status(400).json({
        message:
          "Email and password are required."
      });
    }


    db.query(
      `
      SELECT *
      FROM users
      WHERE email = ?
      `,
      [email],

      async (error, results) => {

        if (error) {

          console.error(error);

          return res.status(500).json({
            message: "Database error."
          });
        }


        if (results.length === 0) {

          return res.status(401).json({
            message:
              "Invalid email or password."
          });
        }


        const user =
          results[0];


        const passwordMatch =
          await bcrypt.compare(
            password,
            user.password
          );


        if (!passwordMatch) {

          return res.status(401).json({
            message:
              "Invalid email or password."
          });
        }


        req.session.userId =
          user.id;

        req.session.userName =
          user.name;

        req.session.userEmail =
          user.email;


        res.json({

          message:
            "Login successful!",

          user: {
            id: user.id,
            name: user.name,
            email: user.email
          }
        });
      }
    );
  }
);


// =====================================================
// SESSION
// =====================================================

app.get(
  "/api/session",
  requireAuth,
  (req, res) => {

    res.json({

      loggedIn: true,

      user: {
        id: req.session.userId,
        name: req.session.userName,
        email: req.session.userEmail
      }
    });
  }
);


// =====================================================
// LOGOUT
// =====================================================

app.post(
  "/api/logout",
  requireAuth,
  (req, res) => {

    req.session.destroy(
      (error) => {

        if (error) {

          console.error(error);

          return res.status(500).json({
            message:
              "Could not log out."
          });
        }


        res.clearCookie(
          "connect.sid"
        );


        res.json({
          message:
            "Logged out successfully."
        });
      }
    );
  }
);


// =====================================================
// PROFILE
// =====================================================


// GET PROFILE

app.get(
  "/api/profile/:userId",
  requireAuth,
  (req, res) => {

    const userId =
      req.session.userId;


    db.query(
      `
      SELECT
        id,
        name,
        email,
        created_at

      FROM users

      WHERE id = ?
      `,
      [userId],

      (error, results) => {

        if (error) {

          console.error(error);

          return res.status(500).json({
            message:
              "Could not load profile."
          });
        }


        if (results.length === 0) {

          return res.status(404).json({
            message:
              "User not found."
          });
        }


        res.json(
          results[0]
        );
      }
    );
  }
);


// UPDATE PROFILE

app.put(
  "/api/profile/:userId",
  requireAuth,
  (req, res) => {

    const userId =
      req.session.userId;


    const {
      name,
      email
    } = req.body;


    if (
      !name ||
      !email
    ) {

      return res.status(400).json({
        message:
          "Name and email are required."
      });
    }


    db.query(
      `
      SELECT id

      FROM users

      WHERE email = ?
      AND id != ?
      `,
      [
        email,
        userId
      ],

      (error, results) => {

        if (error) {

          console.error(error);

          return res.status(500).json({
            message:
              "Database error."
          });
        }


        if (results.length > 0) {

          return res.status(400).json({
            message:
              "That email is already being used."
          });
        }


        db.query(
          `
          UPDATE users

          SET
            name = ?,
            email = ?

          WHERE id = ?
          `,
          [
            name,
            email,
            userId
          ],

          (error) => {

            if (error) {

              console.error(error);

              return res.status(500).json({
                message:
                  "Could not update profile."
              });
            }


            req.session.userName =
              name;

            req.session.userEmail =
              email;


            res.json({

              message:
                "Profile updated successfully!",

              user: {
                id: userId,
                name,
                email
              }
            });
          }
        );
      }
    );
  }
);


// CHANGE PASSWORD

app.put(
  "/api/profile/:userId/password",
  requireAuth,
  (req, res) => {

    const userId =
      req.session.userId;


    const {
      currentPassword,
      newPassword
    } = req.body;


    if (
      !currentPassword ||
      !newPassword
    ) {

      return res.status(400).json({
        message:
          "Current password and new password are required."
      });
    }


    if (
      newPassword.length < 6
    ) {

      return res.status(400).json({
        message:
          "New password must be at least 6 characters."
      });
    }


    db.query(
      `
      SELECT password
      FROM users
      WHERE id = ?
      `,
      [userId],

      async (error, results) => {

        if (error) {

          console.error(error);

          return res.status(500).json({
            message:
              "Database error."
          });
        }


        if (results.length === 0) {

          return res.status(404).json({
            message:
              "User not found."
          });
        }


        const passwordMatch =
          await bcrypt.compare(
            currentPassword,
            results[0].password
          );


        if (!passwordMatch) {

          return res.status(401).json({
            message:
              "Current password is incorrect."
          });
        }


        const hashedPassword =
          await bcrypt.hash(
            newPassword,
            10
          );


        db.query(
          `
          UPDATE users
          SET password = ?
          WHERE id = ?
          `,
          [
            hashedPassword,
            userId
          ],

          (error) => {

            if (error) {

              console.error(error);

              return res.status(500).json({
                message:
                  "Could not change password."
              });
            }


            res.json({
              message:
                "Password changed successfully!"
            });
          }
        );
      }
    );
  }
);


// =====================================================
// TASKS
// =====================================================


// GET TASKS

app.get(
  "/api/tasks/:userId",
  requireAuth,
  (req, res) => {

    const userId =
      req.session.userId;


    db.query(
      `
      SELECT *

      FROM tasks

      WHERE user_id = ?

      ORDER BY due_date ASC
      `,
      [userId],

      (error, results) => {

        if (error) {

          console.error(error);

          return res.status(500).json({
            message:
              "Could not load tasks."
          });
        }


        res.json(results);
      }
    );
  }
);


// ADD TASK

app.post(
  "/api/tasks",
  requireAuth,
  (req, res) => {

    const userId =
      req.session.userId;


    const {
      title,
      description,
      due_date,
      priority
    } = req.body;


    if (
      !title ||
      !due_date
    ) {

      return res.status(400).json({
        message:
          "Task title and due date are required."
      });
    }


    db.query(
      `
      INSERT INTO tasks
      (
        user_id,
        title,
        description,
        due_date,
        priority
      )

      VALUES (?, ?, ?, ?, ?)
      `,
      [
        userId,
        title,
        description || "",
        due_date,
        priority || "medium"
      ],

      (error, result) => {

        if (error) {

          console.error(error);

          return res.status(500).json({
            message:
              "Could not add task."
          });
        }


        res.status(201).json({

          message:
            "Task added successfully!",

          taskId:
            result.insertId
        });
      }
    );
  }
);


// UPDATE TASK

app.put(
  "/api/tasks/:id",
  requireAuth,
  (req, res) => {

    const taskId =
      req.params.id;


    const userId =
      req.session.userId;


    const {
      title,
      description,
      due_date,
      priority,
      status
    } = req.body;


    if (
      !title ||
      !due_date ||
      !priority ||
      !status
    ) {

      return res.status(400).json({
        message:
          "Title, due date, priority and status are required."
      });
    }


    db.query(
      `
      UPDATE tasks

      SET
        title = ?,
        description = ?,
        due_date = ?,
        priority = ?,
        status = ?

      WHERE id = ?
      AND user_id = ?
      `,
      [
        title,
        description || "",
        due_date,
        priority,
        status,
        taskId,
        userId
      ],

      (error, result) => {

        if (error) {

          console.error(error);

          return res.status(500).json({
            message:
              "Could not update task."
          });
        }


        if (
          result.affectedRows === 0
        ) {

          return res.status(404).json({
            message:
              "Task not found."
          });
        }


        res.json({
          message:
            "Task updated successfully!"
        });
      }
    );
  }
);


// DELETE TASK

app.delete(
  "/api/tasks/:id",
  requireAuth,
  (req, res) => {

    const taskId =
      req.params.id;


    const userId =
      req.session.userId;


    db.query(
      `
      DELETE FROM tasks

      WHERE id = ?
      AND user_id = ?
      `,
      [
        taskId,
        userId
      ],

      (error, result) => {

        if (error) {

          console.error(error);

          return res.status(500).json({
            message:
              "Could not delete task."
          });
        }


        if (
          result.affectedRows === 0
        ) {

          return res.status(404).json({
            message:
              "Task not found."
          });
        }


        res.json({
          message:
            "Task deleted successfully!"
        });
      }
    );
  }
);


// =====================================================
// ASSIGNMENTS
// =====================================================


// GET ASSIGNMENTS

app.get(
  "/api/assignments/:userId",
  requireAuth,
  (req, res) => {

    const userId =
      req.session.userId;


    db.query(
      `
      SELECT *

      FROM assignments

      WHERE user_id = ?

      ORDER BY due_date ASC
      `,
      [userId],

      (error, results) => {

        if (error) {

          console.error(error);

          return res.status(500).json({
            message:
              "Could not load assignments."
          });
        }


        res.json(results);
      }
    );
  }
);


// ADD MANUAL ASSIGNMENT

app.post(
  "/api/assignments",
  requireAuth,
  (req, res) => {

    const userId =
      req.session.userId;


    const {
      subject,
      title,
      description,
      due_date,
      priority
    } = req.body;


    if (
      !subject ||
      !title ||
      !due_date
    ) {

      return res.status(400).json({
        message:
          "Subject, title and due date are required."
      });
    }


    db.query(
      `
      INSERT INTO assignments
      (
        user_id,
        subject,
        title,
        description,
        due_date,
        priority,
        source
      )

      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        subject,
        title,
        description || "",
        due_date,
        priority || "medium",
        "StudyFlow"
      ],

      (error, result) => {

        if (error) {

          console.error(error);

          return res.status(500).json({
            message:
              "Could not add assignment."
          });
        }


        res.status(201).json({

          message:
            "Assignment added successfully!",

          assignmentId:
            result.insertId
        });
      }
    );
  }
);


// UPDATE ASSIGNMENT

app.put(
  "/api/assignments/:id",
  requireAuth,
  (req, res) => {

    const assignmentId =
      req.params.id;


    const userId =
      req.session.userId;


    const {
      subject,
      title,
      description,
      due_date,
      priority,
      status
    } = req.body;


    if (
      !subject ||
      !title ||
      !due_date ||
      !priority ||
      !status
    ) {

      return res.status(400).json({
        message:
          "Subject, title, due date, priority and status are required."
      });
    }


    db.query(
      `
      UPDATE assignments

      SET
        subject = ?,
        title = ?,
        description = ?,
        due_date = ?,
        priority = ?,
        status = ?

      WHERE id = ?
      AND user_id = ?
      `,
      [
        subject,
        title,
        description || "",
        due_date,
        priority,
        status,
        assignmentId,
        userId
      ],

      (error, result) => {

        if (error) {

          console.error(error);

          return res.status(500).json({
            message:
              "Could not update assignment."
          });
        }


        if (
          result.affectedRows === 0
        ) {

          return res.status(404).json({
            message:
              "Assignment not found."
          });
        }


        res.json({
          message:
            "Assignment updated successfully!"
        });
      }
    );
  }
);


// DELETE ASSIGNMENT

app.delete(
  "/api/assignments/:id",
  requireAuth,
  (req, res) => {

    const assignmentId =
      req.params.id;


    const userId =
      req.session.userId;


    db.query(
      `
      DELETE FROM assignments

      WHERE id = ?
      AND user_id = ?
      `,
      [
        assignmentId,
        userId
      ],

      (error, result) => {

        if (error) {

          console.error(error);

          return res.status(500).json({
            message:
              "Could not delete assignment."
          });
        }


        if (
          result.affectedRows === 0
        ) {

          return res.status(404).json({
            message:
              "Assignment not found."
          });
        }


        res.json({
          message:
            "Assignment deleted successfully!"
        });
      }
    );
  }
);


// =====================================================
// MOCK LMS INTEGRATION
// =====================================================


// Helper to create future demo dates

function getFutureDate(days) {

  const date =
    new Date();

  date.setDate(
    date.getDate() + days
  );

  return date
    .toISOString()
    .slice(0, 10);
}


// =====================================================
// GET DEMO LMS ASSIGNMENTS
// =====================================================

app.get(
  "/api/integrations/demo-lms",
  requireAuth,
  (req, res) => {

    const demoAssignments = [

      {
        external_id:
          "demo_lms_database_001",

        subject:
          "Database Systems",

        title:
          "ER Diagram Assignment",

        description:
          "Create an ER diagram and submit the final database design report.",

        due_date:
          getFutureDate(5),

        priority:
          "high",

        source:
          "Demo LMS",

        external_url:
          "https://example.edu/lms/assignments/database-001"
      },


      {
        external_id:
          "demo_lms_ooad_002",

        subject:
          "Object Oriented Analysis & Design",

        title:
          "Use Case Analysis",

        description:
          "Prepare use case diagrams and descriptions for the selected system.",

        due_date:
          getFutureDate(9),

        priority:
          "medium",

        source:
          "Demo LMS",

        external_url:
          "https://example.edu/lms/assignments/ooad-002"
      },


      {
        external_id:
          "demo_lms_web_003",

        subject:
          "Web Development",

        title:
          "REST API Report",

        description:
          "Complete the REST API research report and upload the final document.",

        due_date:
          getFutureDate(14),

        priority:
          "medium",

        source:
          "Demo LMS",

        external_url:
          "https://example.edu/lms/assignments/web-003"
      }

    ];


    res.json({
      platform:
        "Demo University LMS",

      connected:
        true,

      assignments:
        demoAssignments
    });
  }
);


// =====================================================
// IMPORT LMS ASSIGNMENT
// =====================================================

app.post(
  "/api/integrations/import-assignment",
  requireAuth,
  (req, res) => {

    const userId =
      req.session.userId;


    const {
      subject,
      title,
      description,
      due_date,
      priority,
      source,
      external_id,
      external_url
    } = req.body;


    if (
      !subject ||
      !title ||
      !due_date ||
      !source ||
      !external_id
    ) {

      return res.status(400).json({
        message:
          "Missing LMS assignment information."
      });
    }


    // Check if this LMS assignment
    // was already imported

    db.query(
      `
      SELECT id

      FROM assignments

      WHERE user_id = ?
      AND source = ?
      AND external_id = ?

      LIMIT 1
      `,
      [
        userId,
        source,
        external_id
      ],

      (error, results) => {

        if (error) {

          console.error(error);

          return res.status(500).json({
            message:
              "Could not check imported assignment."
          });
        }


        if (
          results.length > 0
        ) {

          return res.status(409).json({
            message:
              "This assignment has already been imported."
          });
        }


        db.query(
          `
          INSERT INTO assignments
          (
            user_id,
            subject,
            title,
            description,
            due_date,
            priority,
            status,
            source,
            external_id,
            external_url
          )

          VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            userId,
            subject,
            title,
            description || "",
            due_date,
            priority || "medium",
            "pending",
            source,
            external_id,
            external_url || null
          ],

          (error, result) => {

            if (error) {

              console.error(error);

              return res.status(500).json({
                message:
                  "Could not import assignment."
              });
            }


            res.status(201).json({

              message:
                "Assignment imported successfully!",

              assignmentId:
                result.insertId
            });
          }
        );
      }
    );
  }
);


// =====================================================
// EXAMS
// =====================================================


// GET EXAMS

app.get(
  "/api/exams/:userId",
  requireAuth,
  (req, res) => {

    const userId =
      req.session.userId;


    db.query(
      `
      SELECT *

      FROM exams

      WHERE user_id = ?

      ORDER BY
        exam_date ASC,
        exam_time ASC
      `,
      [userId],

      (error, results) => {

        if (error) {

          console.error(error);

          return res.status(500).json({
            message:
              "Could not load exams."
          });
        }


        res.json(results);
      }
    );
  }
);


// ADD EXAM

app.post(
  "/api/exams",
  requireAuth,
  (req, res) => {

    const userId =
      req.session.userId;


    const {
      subject,
      title,
      exam_date,
      exam_time,
      location
    } = req.body;


    if (
      !subject ||
      !title ||
      !exam_date
    ) {

      return res.status(400).json({
        message:
          "Subject, title and exam date are required."
      });
    }


    db.query(
      `
      INSERT INTO exams
      (
        user_id,
        subject,
        title,
        exam_date,
        exam_time,
        location
      )

      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        subject,
        title,
        exam_date,
        exam_time || null,
        location || ""
      ],

      (error, result) => {

        if (error) {

          console.error(error);

          return res.status(500).json({
            message:
              "Could not add exam."
          });
        }


        res.status(201).json({

          message:
            "Exam added successfully!",

          examId:
            result.insertId
        });
      }
    );
  }
);


// UPDATE EXAM

app.put(
  "/api/exams/:id",
  requireAuth,
  (req, res) => {

    const examId =
      req.params.id;


    const userId =
      req.session.userId;


    const {
      subject,
      title,
      exam_date,
      exam_time,
      location,
      status
    } = req.body;


    if (
      !subject ||
      !title ||
      !exam_date ||
      !status
    ) {

      return res.status(400).json({
        message:
          "Subject, title, exam date and status are required."
      });
    }


    db.query(
      `
      UPDATE exams

      SET
        subject = ?,
        title = ?,
        exam_date = ?,
        exam_time = ?,
        location = ?,
        status = ?

      WHERE id = ?
      AND user_id = ?
      `,
      [
        subject,
        title,
        exam_date,
        exam_time || null,
        location || "",
        status,
        examId,
        userId
      ],

      (error, result) => {

        if (error) {

          console.error(error);

          return res.status(500).json({
            message:
              "Could not update exam."
          });
        }


        if (
          result.affectedRows === 0
        ) {

          return res.status(404).json({
            message:
              "Exam not found."
          });
        }


        res.json({
          message:
            "Exam updated successfully!"
        });
      }
    );
  }
);


// DELETE EXAM

app.delete(
  "/api/exams/:id",
  requireAuth,
  (req, res) => {

    const examId =
      req.params.id;


    const userId =
      req.session.userId;


    db.query(
      `
      DELETE FROM exams

      WHERE id = ?
      AND user_id = ?
      `,
      [
        examId,
        userId
      ],

      (error, result) => {

        if (error) {

          console.error(error);

          return res.status(500).json({
            message:
              "Could not delete exam."
          });
        }


        if (
          result.affectedRows === 0
        ) {

          return res.status(404).json({
            message:
              "Exam not found."
          });
        }


        res.json({
          message:
            "Exam deleted successfully!"
        });
      }
    );
  }
);


// =====================================================
// START SERVER
// =====================================================

app.listen(
  PORT,
  () => {

    console.log(
      `Server running at http://localhost:${PORT}`
    );
  }
);