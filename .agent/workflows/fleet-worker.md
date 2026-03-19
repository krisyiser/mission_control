---
description: Fleet Worker mode for Antigravity agents. Connects the local agent to the Mission Control dashboard.
---

// turbo-all

# 🤖 Antigravity Fleet Worker Workflow

This workflow transforms your local Antigravity agent into a synchronized worker for the **Mission Control** dashboard.

## 🔄 The Work Cycle

To start a work cycle, simply ask the agent: "Run the fleet-worker workflow".

1. **Check-In**:
   - The agent sends a heartbeat to the Mission Control API.
   - It reports its current status: `idle`, `working`, or `online`.

2. **Fetch Task**:
   - The agent queries the Mission Control API for the next high-priority task assigned to this machine ID.
   - Required info: `Task ID`, `Repo URL`, `Branch`, `Requirements`.

3. **Environment Setup**:
   - If the task is for a different repo, the agent will:
     - `git clone` or `cd` into the project.
     - `git checkout -b task/[id]-[title]`.

4. **Execution**:
   - The agent reads the requirements.
   - It performs the necessary code changes.
   - It runs local tests/lints to ensure quality.

5. **Reporting & Commit**:
   - Once finished, the agent:
     - `git add .`
     - `git commit -m "[Task ID] [Title] - Completed by Antigravity Agent"`
     - `git push origin task/[id]-[title]`
     - Updates Mission Control task status to `review`.

---

## 🛠️ Configuration

To use this on your other 3 laptops:
1. Copy this file to `.agent/workflows/fleet-worker.md`.
2. Ensure you have the `MISSION_CONTROL_URL` and `MACHINE_ID` set in your environment or a `.env` file.

**Ready to start the fleet?**
