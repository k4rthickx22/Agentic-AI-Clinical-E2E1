import matplotlib.pyplot as plt

tasks = [
    "Literature Survey",
    "Dataset Preparation",
    "ML Model Development",
    "Agent System Integration",
    "Testing & Optimization",
    "Deployment & Documentation"
]

start = [1, 2, 3, 4, 5, 6]
duration = [1, 1, 1, 1, 1, 1]

plt.figure(figsize=(10,5))
plt.barh(tasks, duration, left=start)

plt.xlabel("Months")
plt.ylabel("Project Phases")
plt.title("Project Gantt Chart")

plt.xticks([1,2,3,4,5,6],
           ["Month 1","Month 2","Month 3","Month 4","Month 5","Month 6"])

plt.grid(True)

plt.show()