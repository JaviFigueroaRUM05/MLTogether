// Getter methods
let getById = (id, parent) => parent ? parent.getElementById(id) : getById(id, document);
let getByClass = (className, parent) => parent ? parent.getElementsByClassName(className) : getByClass(className, document);

// Doc access standards
const DOM = {
  projectListArea: getById("project-list-area"),
  projectArea: getById("project-area"),
  projectList: getById("project-list"),
  project: getById("projects"),
  projectListItem: getByClass("project-list-item"),
  projectAreaName: getById("name", this.projectArea),
  projectAreaPic: getById("pic", this.projectArea),
  projectAreaNavbar: getById("navbar", this.projectArea),
  projectAreaDetails: getById("details", this.projectAreaNavbar),
  projectAreaOverlay: getByClass("overlay", this.projectArea)[0],
  profileSettings: getById("profile-settings"),
  settings: getById("general-settings"),
  profilePic: getById("profile-pic"),
  profilePicInput: getById("profile-pic-input"),
  inputName: getById("input-name"),
  username: getById("username"),
  displayPic: getById("display-pic"),
}

let myClassList = (element) => {
  return {
    add: (className) => {
      element.classList.add(className);
      return myClassList(element);
    },
    remove: (className) => {
      element.classList.remove(className);
      return myClassList(element);
    },
    contains: (className, callback) => {
      if (element.classList.contains(className))
      callback(myClassList(element));
    }
  };
};

// for mobile use: keep track of projectList vs project areas
let areaSwap = false;
// current project: viewed in project area
let project = null;
// all Projects
let projectList = [];
// generate projectList with placeholder data
let createProjectList = () =>{
  // projectList[];
  let included = {}; //projects already included
  ProjectUtils.getProjects()
  .forEach((prj) => {
    projectList.push(prj);
  });
};

let viewProjectList = () => {
  DOM.projectList.innerHTML = "";
  projectList
  .forEach((item, i) => {
    let unreadClass = item.notifications > 0 ? "unread":"";
    DOM.projectList.innerHTML += `
    <div class="project-list-item d-flex flex-row w-100 p-2 border-bottom ${unreadClass}" onclick="generateProjectArea(this, ${i})" id="project-list-item">
    <img src="${item.projectPic}" alt="Profile Photo" class="img-fluid rounded-circle mr-2" style="height:50px;">
    <div class="w-50">
    <div class="name" id="project-item-name">${item.name}</div>
    <div class="small status" id="project-item-status">Project Type Here</div>
    </div>
    <div class="flex-grow-1 text-right">
    <div class="small time">${mDate(item.lastSeen).projectListFormat()}</div>
    <a class="nav-link" data-toggle="dropdown" href="#">
    <i class="far fa-bell"></i>
    ${item.notifications ? "<div class=\"badge badge-info small\" id=\"unread-count\">" + item.notifications + "</div>" : ""}
    </a>
    </div>
    </div>
    `;
    if(item.notifications>0){
      document.getElementById("project-list-item").style.fontWeight = "bold";
      document.getElementById("project-item-name").style.fontWeight = "bold";
      document.getElementById("project-item-status").style.fontWeight = "bold";
    }
  });
};

let generateProjectList = () =>{
  createProjectList();
  viewProjectList();
};

let addDateToProjectArea = (date) => {
  DOM.projects.innerHTML += `
  <div class="mx-auto my-2 bg-primary text-white small py-1 px-2 rounded">
  ${date}
  </div>
  `;
};

let generateProjectArea = (item, projectIndex) => {
  project = projectList[projectIndex];

  myClassList(DOM.projectAreaOverlay).add("d-none");

  [...DOM.projectListItem].forEach((item) => myClassList(item).remove("active"));
  if(project.notifications > 0){
    myClassList(item.querySelector("#unread-count")).add("d-none");
    ProjectUtils.changeStatusById(project.id);
    document.getElementById("project-list-item").style.fontWeight = "normal";
    document.getElementById("project-item-name").style.fontWeight = "normal";
    document.getElementById("project-item-status").style.fontWeight = "normal";
  }


  if (window.innerWidth <=575) {
    myClassList(DOM.projectListArea).remove("d-flex").add("d-none");
    myClassList(DOM.projectArea).remove("d-none").add("d-flex");
    areaSwap = true;
  }
  else{
    myClassList(item).add("active");
  }

  DOM.projectAreaName.innerHTML = project.name;
  DOM.projectAreaPic.src = project.projectPic;

  DOM.projectAreaDetails.innerHTML = `last seen ${mDate(project.lastSeen).projectListFormat()}`;
  document.getElementById('pageHead').innerHTML = project.name;
  document.getElementById('link-head').innerHTML = project.projectLink;

  document.getElementById("proj-desc").innerHTML = project.description;
};

let showProjectList = () => {
  if (areaSwap){
    myClassList(DOM.projectListArea).remove("d-none").add("d-flex");
    myClassList(DOM.projectArea).remove("d-flex").add("d-none");
    areaSwap = false;
  }
};

function clipboard() {
  /* Alert the copied text */
  alert("Copied the text: ");
};

let showProfileSettings = () => {
  DOM.profileSettings.style.left = 0;
  DOM.profilePic.src = user.pic;
  DOM.inputName.value = user.name;
};

let showSettings = () => {
  DOM.settings.style.left = 0;
  DOM.profilePic.src = user.pic;
  DOM.inputName.value = user.name;
};

let hideProfileSettings = () => {
  DOM.profileSettings.style.left = "-110%";
  DOM.username.innerHTML = user.name;
};

let hideSettings = () => {
  DOM.settings.style.left = "-110%";
  DOM.username.innerHTML = user.name;
};

function toggleChangeTheme(){
  if(document.getElementById("theme-check").checked === true){
   console.log('light');
   document.getElementById("css-file").setAttribute('href', "css/style.css")
 } else {
   console.log('dark');
   document.getElementById("css-file").setAttribute('href', "css/dark.css")
 }
}

window.addEventListener("resize", e => {
  if (window.innerWidth > 575) showProjectList();
});

let init = () => {
  DOM.username.innerHTML = user.name;
  DOM.displayPic.src = user.pic;
  DOM.profilePic.stc = user.pic;
  DOM.profilePic.addEventListener("click", () => DOM.profilePicInput.click());
  DOM.profilePicInput.addEventListener("change", () => console.log(DOM.profilePicInput.files[0]));
  DOM.inputName.addEventListener("blur", (e) => user.name = e.target.value);
  generateProjectList();
};

init();
