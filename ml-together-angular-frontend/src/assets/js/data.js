let user = {
	id: 0,
	name: "Developer",
	pic: "./assets/images/Icon.png",
  email: "developer@gmail.com"
};

let projects = [
  {
    id: 0,
    ownerID: 0,
    name: "Project",
    description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    lastSeen: "February 25, 2020 18:15:23",
    projectPic: "./assets/images/p.png",
    projectLink: "www.example.com",
    status: 0,
    notifications: 1
  },
  {
    id: 1,
    ownerID: 0,
    name: "Project2",
    description:"Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    lastSeen: "February 25, 2020 18:15:23",
    projectPic: "./assets/images/p.png",
    projectLink: "www.example.com/2",
    status: 0,
    notifications: 0
  },
	{
    id: 3,
    ownerID: 0,
    name: "Project3",
    description:"Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    lastSeen: "February 25, 2020 18:15:23",
    projectPic: "./assets/images/p.png",
    projectLink: "www.example.com/2",
    status: 0,
    notifications: 0
  },
	{
    id: 4,
    ownerID: 0,
    name: "Project4",
    description:"Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    lastSeen: "February 25, 2020 18:15:23",
    projectPic: "./assets/images/p.png",
    projectLink: "www.example.com/2",
    status: 0,
    notifications: 0
  },
	{
    id: 5,
    ownerID: 0,
    name: "Project5",
    description:"Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    lastSeen: "February 25, 2020 18:15:23",
    projectPic: "./assets/images/p.png",
    projectLink: "www.example.com/2",
    status: 0,
    notifications: 0
  },
	{
    id: 6,
    ownerID: 0,
    name: "Project6",
    description:"Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    lastSeen: "February 25, 2020 18:15:23",
    projectPic: "./assets/images/p.png",
    projectLink: "www.example.com/2",
    status: 0,
    notifications: 0
  },
	{
    id: 7,
    ownerID: 0,
    name: "Project7",
    description:"Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    lastSeen: "February 25, 2020 18:15:23",
    projectPic: "./assets/images/p.png",
    projectLink: "www.example.com/2",
    status: 0,
    notifications: 0
  },
	{
    id: 8,
    ownerID: 0,
    name: "Project8",
    description:"Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    lastSeen: "February 25, 2020 18:15:23",
    projectPic: "./assets/images/p.png",
    projectLink: "www.example.com/2",
    status: 0,
    notifications: 0
  },
	{
    id: 9,
    ownerID: 0,
    name: "Project9",
    description:"Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    lastSeen: "February 25, 2020 18:15:23",
    projectPic: "./assets/images/p.png",
    projectLink: "www.example.com/2",
    status: 0,
    notifications: 0
  }
]

let ProjectUtils = {
  getProjects:()=>{
    return projects;
  },
  changeStatusById: (id) => {
    projects = projects.map((project) => {
      project.notifications = 0;
      return project;
    });
  }
};
