# Frontend Documentation

## Project Overview
This project is a React-based frontend application designed to manage the student journey for taking quizzes. It integrates with a NestJS backend (which remains strictly read-only for this frontend scope) and orchestrates quiz navigation, attempt initiation, solving, continuous saving, and attempt submission.

## Student Journey & Application Flow
1. **Entry**: Students arrive at the Dashboard where they view accessible quizzes.
2. **Gateway/Instructions**: Before starting, students view quiz instructions. If the quiz is restricted or closed, they see friendly error states.
3. **Invitations**: Students can access specific quizzes via invitation links (`/invite/:token`).
4. **Start Attempt**: Once validated, students start an attempt.
5. **Solving**: The attempt is presented question-by-question. Answers are auto-saved locally and to the backend.
6. **Submit**: After answering, the student submits the attempt. Re-submission is prevented, and success feedback is shown.

## Routing Structure
- `/` -> Dashboard
- `/quizzes/:quizId` -> Quiz Gateway (Instructions/Start)
- `/quizzes/:quizId/attempt` -> Quiz Attempt (Solving Flow)
- `/invite/:token` -> Invitation Flow
- `*` -> Not Found

## Component Structure
- **Pages**: `DashboardPage`, `QuizGatewayPage`, `QuizAttemptPage`, `InvitationPage`
- **Shared Components**: `MessagePage` (used for errors, closed states, completion), `AccessDenied`, `QuizClosed`, `NotFound`
- **Features**: `QuizzesList`, `QuizCard`

## State Management
The application uses Redux Toolkit (RTK) along with RTK Query.
- **Global State**: Handled primarily via RTK Query cache.
- **Local State**: Managed via React `useState` and `useRef` for UI interactions (e.g., current question index, pending answer edits, debounce timers).

## RTK Query APIs
- `getStudentQuizzes`: Fetches the dashboard.
- `getStudentQuiz`: Retrieves instructions and gateway data.
- `getInvitation`: Resolves invitation tokens.
- `startAttempt`: Creates a new attempt.
- `getAttempt`: Restores an in-progress attempt.
- `saveAnswer`: Continuously saves an answer.
- `submitAttempt`: Submits the final attempt.

## Frontend API Integration
The frontend strictly respects the provided backend endpoints and contracts. Where backend dependencies are missing (e.g., `getAttempt`), the frontend is structured to gracefully connect once the API becomes available, according toREST conventions. Event notifications (e.g., updating invitation statuses) are inherently handled by the backend's internal event bus upon submission.

## Error Handling
Errors are caught gracefully without exposing stack traces, HTTP status codes, or raw JSON. Friendly messaging is provided via the shared `MessagePage` component.

## Loading Strategy
The frontend utilizes RTK Query's `isLoading` and `isFetching` states. A consistent loading spinner or descriptive text ("Loading...") is shown to prevent empty screens. Submissions disable interactive controls to prevent duplicate network requests.

## Auto Save Strategy
Answers are persisted locally on every stroke or selection. A `useRef`-based debounce utility triggers a `PUT` mutation after 500ms of inactivity per question. If a save fails, a lightweight status indicator displays "Retrying..." or "Error saving" without blocking the user.

## Resume Strategy
If the user refreshes the page, the `getAttempt` query fetches the active attempt. A `useEffect` hook parses the `attemptAnswers` payload to restore the local answer state and calculation of the first unanswered question to resume the solving flow at the correct index.

## Submit Flow
Submission triggers the `POST /attempts/:attemptId/submit` endpoint. Double-clicks are prevented by disabling the submit button. Upon success (or if the backend indicates it was already submitted), the user is presented with a completion `MessagePage`.

## Accessibility
Semantic HTML elements (buttons, inputs) are used. Form elements are properly labelled. Visual focus management is handled via Tailwind's ring utilities. Status updates are visually distinct.

## Responsive Design
Tailwind CSS provides responsive breakpoints (`sm`, `md`, `lg`) ensuring usability across Desktop, Tablet, and Mobile devices. Containers use `max-w-*` properties with horizontal padding to adapt seamlessly.

## Known Backend Dependencies
- **Omar's Attempt API (`getAttempt`)**: The frontend expects a GET endpoint to fetch attempt details and answers.

## Future Improvements
- Implement optimistic updates for `saveAnswer`.
- Enhanced offline mode using service workers or local storage persistence fallback.
- Advanced pagination and review screens before submission.
