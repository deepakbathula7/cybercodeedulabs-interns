# Kanban Board — Manual Test Cases

**Tester:** Anushka Prasad (`Anushkaprasad11`) **Date:** 12/06/2026 | **Week:** 2 | **Total:** 35 Test Cases **App URL:** <https://cybercodeedulabs.com/internal/kanbanboard>

**Pass:** 28 | **Fail:** 6 | **Blocked:** 0 | **Partially Pass:** 1

---

## 1. Login & Authentication

| ID    | Feature                 | Steps                                                              | Expected Result                   | Actual Result                                                         | P/F  |
| ----- | ------------------------ | ------------------------------------------------------------------ | ---------------------------------- | --------------------------------------------------------------------- | ---- |
| TC-01 | Valid login             | 1. Go to login page 2. Enter valid email & password 3. Click Login | Redirects to Kanban dashboard     | Directs to login properly                                             | pass |
| TC-02 | Invalid password        | 1. Enter valid email 2. Enter wrong password 3. Click Login        | Error: "Invalid credentials"      | Shows "invalid credentials"                                           | pass |
| TC-03 | Invalid email format    | 1. Enter `notanemail` 2. Click Login                               | Validation error shown            | Validation error shown                                                | pass |
| TC-04 | Empty email field       | 1. Leave email blank 2. Enter password 3. Click Login              | Error: "Email is required"        | "Please fill this" is shown                                           | pass |
| TC-05 | Empty password field    | 1. Enter valid email 2. Leave password blank 3. Click Login        | Error: "Password is required"     | "Please fill this" is shown                                           | pass |
| TC-06 | Both fields empty       | 1. Leave both fields blank 2. Click Login                          | Both fields show validation error | "Please fill this" bubble is shown                                    | pass |
| TC-07 | Session persistence     | 1. Login 2. Close tab 3. Check tab 4. Reopen URL                   | User remains logged in            | User remains logged in                                                | pass |
| TC-08 | Direct URL (logged out) | 1. Log out 2. Paste board URL in browser                           | Redirects to login page           | "Login with your CyberCode EduLabs account to continue" page is shown | pass |

---

## 2. Task List

| ID    | Feature                  | Steps                                   | Expected Result                      | Actual Result                        | P/F  |
| ----- | ------------------------- | ---------------------------------------- | -------------------------------------- | --------------------------------------- | ---- |
| TC-09 | Tasks load on login      | 1. Login with valid credentials         | Task cards visible within 3s         | Task cards visible within 3s         | pass |
| TC-10 | Correct tasks for user   | 1. Login as User A 2. Check tasks shown | Only tasks for User A displayed      | Tasks for User A displayed           | pass |
| TC-11 | Filter — Pending         | 1. Click "Pending" filter               | Only Pending tasks shown             | Only Pending tasks shown             | pass |
| TC-12 | Filter — In Progress     | 1. Click "In Progress" filter           | Only In Progress tasks shown         | Only In Progress tasks shown         | pass |
| TC-13 | Filter — Done            | 1. Click "Done" filter                  | Only Done tasks shown                | Only Done tasks shown                | pass |
| TC-14 | Clear filter             | 1. Apply filter 2. Select "All"         | All tasks visible again              | All tasks visible again              | pass |
| TC-15 | Search by keyword        | 1. Type known task title keyword        | Matching tasks appear; others hidden | Matching tasks appear; others hidden | pass |
| TC-16 | Search — no results      | 1. Type random string `zzzzxxx`         | Empty state: "No tasks found"        | No tasks found                       | pass |
| TC-17 | Search + filter combined | 1. Apply "In Progress" 2. Type keyword  | Results filtered by both criteria    | Results filtered by both criteria    | pass |

---

## 3. Task Detail View

| ID    | Feature                 | Steps                                    | Expected Result                                                      | Actual Result                          | P/F  |
| ----- | ------------------------- | ------------------------------------------ | ------------------------------------------------------------------------ | ----------------------------------------- | ---- |
| TC-18 | Click task opens detail | 1. Click any task card                   | Detail modal opens without page reload                               | Detail modal opens without page reload | pass |
| TC-19 | All fields display      | 1. Open task detail                      | Title, Description, Status, Priority, Assignee, Due Date all visible | All fields are displayed               | pass |
| TC-20 | Comments load           | 1. Open task with existing comments      | All comments shown oldest → newest                                   | All comments shown oldest → newest     | pass |
| TC-21 | Close detail view       | 1. Open task 2. Click X or outside modal | Modal closes; returns to board cleanly                               | Returns to board cleanly               | pass |

---

## 4. Add Comment

| ID    | Feature                  | Steps                               | Expected Result                       | Actual Result                        | P/F  |
| ----- | -------------------------- | -------------------------------------- | ---------------------------------------- | --------------------------------------- | ---- |
| TC-22 | Comment box visible      | 1. Open any task detail             | Comment input box present and visible | Comment input visible                | pass |
| TC-23 | Submit valid comment     | 1. Type a comment 2. Click Submit   | Comment appears immediately in thread | Appears immediately in thread        | pass |
| TC-24 | Author + timestamp       | 1. Submit a comment                 | Comment shows username and post time  | Comment shows username and post time | pass |
| TC-25 | Empty comment rejected   | 1. Leave box empty 2. Click Submit  | Button disabled OR error shown        | Button disabled OR error shown       | pass |
| TC-26 | Whitespace-only rejected | 1. Type spaces only 2. Click Submit | Treated as empty; rejected            | Yes, rejected                        | pass |

---

## 5. Edge Cases

| ID    | Feature                          | Steps                                                                                  | Expected Result                                    | Actual Result                                             | P/F          |
| ----- | ----------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------- | -------------- |
| TC-27 | Very long task title             | 1. Find task with 200+ char title                                                     | Title truncates with ellipsis; layout intact       | Keeps going and does not truncate                         | fail         |
| TC-28 | Slow connection                  | 1. DevTools → Network → Slow 3G 2. Reload board                                       | Spinner shown; no crash or blank screen            | No crash or blank screen                                  | pass         |
| TC-29 | Mobile viewport (DevTools)       | 1. DevTools → Ctrl+Shift+M → iPhone 12 2. Navigate board                              | Layout responsive; buttons tappable                | Layout responsive but very compact; buttons not tappable  | fail         |
| TC-30 | Mobile — real device             | 1. Open URL on phone                                                                   | No overflow, readable columns, functional buttons  | No overflow, readable columns, functional buttons         | pass         |
| TC-31 | Create task with empty title     | 1. Open Create Task form 2. Leave title field blank 3. Click Create                   | Error shown: title is required; task is not created | Nothing happens                                        | partially pass  |
| TC-32 | Create task with 500+ char title | 1. Open Create Task form 2. Paste a 500+ character string into the title field 3. Click Create | Either blocked with a max-length error, or input truncated to a safe limit before save; layout must not break | Keeps taking in characters does not give any warning               | fail  |
| TC-33 | Create task with missing assignee | 1. Open Create Task form 2. Fill title 3. Leave Assignee field blank 4. Click Create | Error shown: assignee is required; task is not created | the task gets created without an assignee                                        | fail  |
| TC-34 | Move task to an invalid column   | 1. Begin dragging a task card 2. Attempt to drop it outside any defined column (e.g. blank board area) | Task snaps back to its original column; no status change persisted; no crash | cannot drag card                          | fail  |
| TC-35 | Move task via drag and drop (positive) | 1. Drag a task from one column (e.g. Pending) 2. Drop it into another column (e.g. In Progress) | Task moves visually; status updates and persists on reload | cannot drag card                                        | fail  |

---

## Summary

| Area         | Total  | Passed | Failed | Blocked | Partially Pass |
| -------------- | -------- | -------- | -------- | --------- | ------------- |
| Login & Auth | 8      | 8      | 0      | 0       | 0           |
| Task List    | 9      | 9      | 0      | 0       | 0           |
| Task Detail  | 4      | 4      | 0      | 0       | 0           |
| Add Comment  | 5      | 5      | 0      | 0       | 0           |
| Edge Cases   | 9      | 2      | 6      | 0       | 1           |
| **TOTAL**    | **35** | **28** | **6**  | **0**   | **1**       |

---

*Tested by: Anushka Prasad | CyberCode EduLabs Internship — Week 2*
