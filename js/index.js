$(document).ready(function () {
    $("#tb").tablesorter();
});

$(window).on('load', function () {
    $("#loader-container").fadeOut(1000);
    if (window.document.cookie.split('_id=')[1] != '') {
        getUser(window.document.cookie.split('_id=')[1]);
        loadProjects();
        loadMyTasks();
        resetDate();
    } else {
        logOut();
    }
});

function loadMyTasks() {
    $('#todayTodoList').empty();
    $("#myTaskTable").empty();
    $.ajax({
        url: "http://localhost:4000/task",
        method: "GET",
        success: function (resp) {
            let isEmpty = true;
            let todo = `
                    <table class="table" cellspacing="0" style=" font-size: small;">
                        <thead>
                            <tr>
                                <th></th>
                                <th style="width: 220px;">TASKS</th>
                                <th style="width: 120px;">STATUS</th>
                                <th>OWNER</th>
                                <th>START DATE</th>
                                <th>DUE DATE</th>
                                <th>PRIORITY</th>
                            </tr>
                        </thead>
                        <tbody id="myTaskTable"> </tbody>
                    </table>`;
            $('#todayTodoList').append(todo);
            for (const i of resp) {
                if (window.user._id == i.assignee_id) {
                    isEmpty = false;

                    let row = `<tr>
                        <td>
                            <i class="fa fa-sharp fa-solid fa-play fa-xs"
                            style="font-size: small; margin-right: 10px;"
                            data-toggle="collapse" data-target="#A-child-1"></i>
                            <i class="fa fa-solid fa-square" style="color:${setColor(i.status)}"></i>
                            </td>
                            <td>${i.task_name}</td>
                            <td>
                                <select class="custom-select btnStatus" id="myStatus${i._id}" onchange="myStatusChange('${i._id}')"
                                style="background-color:${setColor(i.status)}; width:120px; font-size:small;"
                                >
                                    <option class="statusList" selected>${i.status}</option>
                                    <option class="statusList" value="OPEN">OPEN</option>
                                    <option class="statusList" value="PENDING">PENDING</option>
                                    <option class="statusList" value="IN PROGRESS">IN PROGRESS</option>
                                    <option class="statusList" value="IN REVIEW">IN REVIEW</option>
                                    <option class="statusList" value="ACCEPTED">ACCEPTED</option>
                                    <option class="statusList" value="REJECTED">REJECTED</option>
                                    <option class="statusList" value="BLOCKED">BLOCKED</option>
                                    <option class="statusList" value="CLOSED">CLOSED</option>
                                    </select>
                                    </td>
                                    <td>
                                        <div
                                    style="display: flex; direction: row; justify-content: space-around;">
                                    <img src="assets/download.png" alt="img" width="30" height="30">
                                    
                                </div>

                                </td>
                                <td>${i.start_date}</td>
                                <td>
                                    <p style="color:${window.today <= i.due_date || i.status == 'CLOSED' ? 'black' : 'red'};">${i.due_date}</p>
                                </td>
                                <td>
                                    <i class="fa fa-flag" onclick="changePriority('${i._id}','${i.priority}')"
                                     style="color:${i.priority == 0 ? 'black' : 'red'};"></i>
                                </td>
                            </tr>`;
                    $("#myTaskTable").append(row);
                    // let day = i.due_date.split('-')[2];
                    // for (let i = 1; i <= 5; i++) {
                    //     if (day / 7 > i & day / 7 < i + 1) {
                    //         console.log(day);
                    //         let n = parseInt(day-(7*i))+i+2;
                    //         console.log(n);
                    //         let name = 'week' + (i + 1);
                    //         document.getElementById(name).childNodes[n+1].className = 'event';

                    //     }
                    // }
                }
            }
            if (isEmpty) {
                $('#todayTodoList').empty();
                let todo = `<div class="card card-body">
                                Tasks and Reminders that are scheduled for Today will appear here.
                            </div>`;
                $('#todayTodoList').append(todo);
            }
        }
    });
}

function resetDate() {
    let weeks = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var date = new Date();
    console.log(date);
    var day = date.getDate();
    var day1 = date.getDay();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    if (month < 10) month = "0" + month;
    if (day < 10) day = "0" + day;
    var today = year + "-" + month + "-" + day;
    document.getElementById("createDate").value = today;
    document.getElementById("dueDate").value = today;
    window.today = today;

    $('#current-day').text(weeks[day1] + ", " + day);
    $('#btnTodayList').click();


    for (let i = 1; i <= 5; i++) {
        if (day / 7 > i & day / 7 < i + 1) {
            let name = 'week' + (i + 1);
            document.getElementById(name).childNodes[((day1 * 2) + 1)].style.backgroundColor = "#f78536";
        }
    }
}

function logOut() {
    window.document.cookie = `_id=`;
    window.location.assign('login.html');
}

function getUser(id) {
    $.ajax({
        url: "http://localhost:4000/user/" + id,
        method: "GET",
        success: function (res) {
            setUserDetail(res);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert("Auth server error");
        }
    });
}

function setUserDetail(user) {
    window.user = user;
    $('#lblUserName').text(user.f_name);
}

//save project
$('#btnSaveProject').click(function () {
    let project_name = $('#project-name').val();
    let description = $('#description').val();
    let emails = $('#emails').val().split('\n');

    for (const e in emails) {
        console.log("send mail..", e);
    }

    let formData = {
        project_name: project_name,
        owner_id: window.user._id,
        description: description,
        user_list: emails,
        is_active: 1,
    }

    $.ajax({
        url: "http://localhost:4000/project",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(formData),
        success: function (resp) {
            $('#newProjectModal .close').click();
            $('#project-name').val('');
            $('#description').val('');
            $('#emails').val('');
            loadProjects();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert("ERR_CONNECTION_REFUSED");
        }
    });
});

function loadProjects() {
    $.ajax({
        url: "http://localhost:4000/project",
        method: "GET",
        success: function (resp) {
            let x = 1;
            for (const i of resp) {
                let pr = `<a class="collapse-item" href="#" id="${i._id}"  onclick="projectSelect('${i._id}')">${i.project_name}</a>`;
                // for (const e of i.user_list) {
                //     if (e == window.user.emai) {
                //         console.log("asign");
                //         $("#projectList").append(pr);
                //     }
                // }
                // if(i.owner_id == window.user._id){
                //     console.log("owner");
                $("#projectList").append(pr);
                // }
            }
        }
    });
}

// select project
function projectSelect(id) {
    $.ajax({
        url: "http://localhost:4000/project/" + id,
        method: "GET",
        success: function (res) {
            setProjectDetails(res);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert("Auth server error");
        }
    });
}

function setProjectDetails(data) {
    window.project_id = data._id;
    $("#projectPage").css("display", "block");
    $("#homePage").css("display", "none");

    $("#lblProjectName").text(data.project_name);
    $("#lblProjectDesc").text(data.description);
    loadTaskList(data._id);
};

function loadTaskList(project_id) {
    $("#dataTable").empty();
    $.ajax({
        url: "http://localhost:4000/task",
        method: "GET",
        success: function (resp) {
            for (const i of resp) {
                if (project_id == i.project_id) {
                    let row = `<tr>
                        <td>
                            <i class="fa fa-sharp fa-solid fa-play fa-xs"
                            style="font-size: small; margin-right: 10px;"
                            data-toggle="collapse" data-target="#A-child-1"></i>
                            <i class="fa fa-solid fa-square" style="color:${setColor(i.status)}"></i>
                            </td>
                            <td>${i.task_name}</td>
                            <td>
                                <select class="custom-select btnStatus" id="status${i._id}" onchange="statusChange('${i._id}')"
                                style="background-color:${setColor(i.status)};"
                                >
                                    <option class="statusList" selected>${i.status}</option>
                                    <option class="statusList" value="OPEN">OPEN</option>
                                    <option class="statusList" value="PENDING">PENDING</option>
                                    <option class="statusList" value="IN PROGRESS">IN PROGRESS</option>
                                    <option class="statusList" value="IN REVIEW">IN REVIEW</option>
                                    <option class="statusList" value="ACCEPTED">ACCEPTED</option>
                                    <option class="statusList" value="REJECTED">REJECTED</option>
                                    <option class="statusList" value="BLOCKED">BLOCKED</option>
                                    <option class="statusList" value="CLOSED">CLOSED</option>
                                    </select>
                                    </td>
                                    <td>
                                        <div
                                    style="display: flex; direction: row; justify-content: space-around;">
                                    <img src="assets/download.png" alt="img" width="30" height="30">
                                    ${setUser(i._id, i.assignee_id)}
                                </div>

                                </td>
                                <td>${i.start_date}</td>
                                <td>
                                    <p style="color:${window.today <= i.due_date || i.status == 'CLOSED' ? 'black' : 'red'};">${i.due_date}</p>
                                </td>
                                <td>
                                    <i class="fa fa-flag" onclick="changePriority('${i._id}','${i.priority}')"
                                     style="color:${i.priority == 0 ? 'black' : 'red'};"></i>
                                </td>
                            </tr>`;
                    $("#dataTable").append(row);
                }
            }
            loadNewTaskUsers();
        }
    });
}

function setUser(id, user_id) {
    let user = ` <select class="custom-select borderLess" 
    id="userList${id}" onchange="userChange('${id}')" > `;
    $.ajax({
        url: "http://localhost:4000/user",
        method: "GET",
        success: function (resp) {
            for (const i of resp) {
                let u = `<option value="${i._id}">${i.f_name}</option>`;
                if (i._id == user_id) {
                    $(`#userList${id}`).append(`<option value="${user_id}" selected>${i.f_name}</option>`);
                } else {
                    $(`#userList${id}`).append(u);
                }
            }
        }
    });
    return user;
}
function setColor(status) {
    switch (status) {
        case 'OPEN':
            return 'gray';
            break;
        case 'PENDING':
            return 'yellow';
            break;
        case 'IN PROGRESS':
            return 'orange';
            break;
        case 'IN REVIEW':
            return 'orangered';
            break;
        case 'ACCEPTED':
            return 'red';
            break;
        case 'REJECTED':
            return 'palevioletred';
            break;
        case 'BLOCKED':
            return 'yellow';
            break;
        case 'CLOSED':
            return 'green';
            break;
        default:
        //
    }
}
function changePriority(task_id, priority) {
    let formData = {
        status: null,
        assignee_id: null,
        priority: priority == 0 ? 1 : 0,
    }
    $.ajax({
        url: "http://localhost:4000/task/" + task_id,
        method: "PUT",
        contentType: "application/json",
        data: JSON.stringify(formData),
        success: function (resp) {
            loadMyTasks()
        }
    });
}

function myStatusChange(task_id) {
    let status = $(`#myStatus${task_id}`).val();
    let formData = {
        status: status,
        assignee_id: null,
        priority: null
    }
    $.ajax({
        url: "http://localhost:4000/task/" + task_id,
        method: "PUT",
        contentType: "application/json",
        data: JSON.stringify(formData),
        success: function (resp) {
            loadMyTasks();
        }
    });
    loadChat();
}

var msgCount = 1;
function loadChat() {
    let msg1 = `<div class="direct-chat-msg">
    <div class="direct-chat-info clearfix">
        <span class="direct-chat-name pull-left">Kamal Perera</span>
        <span class="direct-chat-timestamp pull-right">18
            Jan 2:00 pm</span>
    </div>

    <img class="direct-chat-img"
        src="https://img.icons8.com/color/36/000000/administrator-male.png"
        alt="message user image">

        <div class="direct-chat-text">
            For what reason would it be advisable for me to
            think about business content?
        </div>
    </div>`;
    let msg2 = `<div class="direct-chat-msg right">
    <div class="direct-chat-info clearfix">
        <span class="direct-chat-name pull-right">Nimali </span>
        <span class="direct-chat-timestamp pull-left">18 Jan
            2:05 pm</span>
    </div>

    <img class="direct-chat-img"
        src="https://img.icons8.com/office/36/000000/person-female.png"
        alt="message user image">

    <div class="direct-chat-text">
        Thank you for your believe in our supports
    </div>

</div>`;
let msg3 = `<div class="direct-chat-msg">
<div class="direct-chat-info clearfix">
    <span class="direct-chat-name pull-left">Kamal
        Perera</span>
    <span class="direct-chat-timestamp pull-right">19
        Jan 5:37 pm</span>
</div>

<img class="direct-chat-img"
    src="https://img.icons8.com/color/36/000000/administrator-male.png"
    alt="message user image">

<div class="direct-chat-text">
    OK.
</div>

</div> `;
    if (msgCount==1) {
        console.log(msgCount===1);
        $("#msgLoader").append(msg1); 
    }else if (msgCount==2) {
        console.log(msgCount===1);
        $("#msgLoader").append(msg2); 
    }else if (msgCount==3) {
        console.log(msgCount===1);
        $("#msgLoader").append(msg3); 
    }else{
        $("#msgLoader").empty(); 
        msgCount = 0;
    }
    $('#chatCount').text(msgCount++);
}

function statusChange(task_id) {
    let status = $(`#status${task_id}`).val();
    let formData = {
        status: status,
        assignee_id: null,
        priority: null
    }
    $.ajax({
        url: "http://localhost:4000/task/" + task_id,
        method: "PUT",
        contentType: "application/json",
        data: JSON.stringify(formData),
        success: function (resp) {
            loadTaskList(window.project_id);
        }
    });
}

function userChange(task_id) {
    let user_id = $(`#userList${task_id}`).val();
    let formData = {
        status: null,
        assignee_id: user_id,
    }
    $.ajax({
        url: "http://localhost:4000/task/" + task_id,
        method: "PUT",
        contentType: "application/json",
        data: JSON.stringify(formData),
        success: function (resp) {
            console.log(resp);
            loadTaskList(window.project_id);
        }
    });
}

// load users list for new task
function loadNewTaskUsers() {
    $("#newTaskUsersList").empty();
    $.ajax({
        url: "http://localhost:4000/user",
        method: "GET",
        success: function (resp) {
            for (const i of resp) {
                let u = `<option value="${i._id}">${i.f_name}</option>`;
                $("#newTaskUsersList").append(u);
            }
        },
        error: function () {
            alert("ERR_CONNECTION_REFUSED");
        }
    });
}

//save Task
$('#btnSaveTask').click(function () {
    let task_name = $('#task-name').val();
    let description = $('#task-description').val();
    let assignee_id = $('#newTaskUsersList').val();
    let start_date = $('#createDate').val();
    let due_date = $('#dueDate').val();
    let status = "OPEN";

    let formData = {
        task_name: task_name,
        description: description,
        project_id: window.project_id,
        owner_id: window.user._id,
        assignee_id: assignee_id,
        start_date: start_date,
        due_date: due_date,
        status: status,
        priority: 0
    }

    $.ajax({
        url: "http://localhost:4000/task",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(formData),
        success: function (resp) {
            $('#newTaskModal .close').click();
            $('#task-name').val('');
            $('#task-description').val('');
            $('#newTaskUsersList').val('');
            resetDate();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert("ERR_CONNECTION_REFUSED");
        }
    });
});

$("#projectPage").css("display", "none");
$("#404Page").css("display", "none");

$("#btnHomePage").click(function () {
    $("#homePage").css("display", "block");
    $("#projectPage").css("display", "none");
    $("#404Page").css("display", "none");
    loadMyTasks();
});