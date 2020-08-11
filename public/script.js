// get db info
var req = new XMLHttpRequest();
req.open("GET", "/showDB", true);
req.setRequestHeader('Content-Type', 'application/json');
req.addEventListener('load', function () {
    if (req.status >= 200 && req.status < 400) {
        createTable(JSON.parse(req.responseText));
    }
});
req.send();

// reset table
document.getElementById("reset").addEventListener("click", function (event) {
    var req = new XMLHttpRequest();
    req.open("GET", "/reset-table", false);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load', function () {
        if (req.status >= 200 && req.status < 400) {
            console.log("received");
        }
        else {
            console.log("Error! " + req.statusText);
        }
    });
    req.send(null);

});

// add new exercise
document.getElementById("addNew").addEventListener("click", function (event) {
    var req = new XMLHttpRequest();
    var context = {};

    context.name = document.getElementById('name').value || null;
    if (context.name == null) { alert("Must Enter Exercise"); return }
    console.log(context.name);
    context.reps = document.getElementById('reps').value;
    context.weight = document.getElementById('weight').value;
    context.date = document.getElementById('date').value;
    if (document.getElementById('lbs').checked) context.unit = 1;
    else context.unit = 0;

    req.open("POST", "/insert", true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load', function () {
        if (req.status >= 200 && req.status < 400) {
            createTable(JSON.parse(req.responseText));
        }
        else {
            console.log("Error! " + req.statusText);
        }
    });
    req.send(JSON.stringify(context));
    event.preventDefault();
});

// create db table
function createTable(dbArray) {

    var dataType = ["name", "reps", "weight", "unit", "date", "edit", "delete"];

    var existingTable = document.getElementById("table");
    if (existingTable.firstChild) existingTable.removeChild(existingTable.firstChild);

    var table = document.createElement("table");
    table.appendChild(document.createElement("thead"));
    table.firstElementChild.appendChild(document.createElement("tr"));

    dataType.forEach(function (idx) {
        var newCell = document.createElement("th")
        if (idx === "edit" || idx === "delete") newCell.textContent = "";
        else
            newCell.textContent = idx;
        table.firstElementChild.firstElementChild.appendChild(newCell);
    });

    //append rows from db
    dbArray.forEach(function (row) {

        var newRow = document.createElement("tr");
        dataType.forEach(function (idx) {

            var newCell = document.createElement("td");

            if (idx === "date") {
                if (row["date"] != null) newCell.innerText = new Date(row[idx].substring(0, 10)).toLocaleDateString();
                newRow.appendChild(newCell);
            }
            else if (idx === "edit" || idx === "delete") {
                createButton(idx, newCell, newRow, row);
                return;
            }
            else if (idx === "unit") {
                if (row["lbs"] === 1) newCell.innerText = "lbs";
                else newCell.innerText = "kgs";
                newRow.appendChild(newCell);
                return;
            }
            else {
                newCell.innerText = row[idx];
                newRow.appendChild(newCell);
            }
        });
        table.appendChild(newRow);
    });
    existingTable.appendChild(table);
}

// remove row
function remove(event) {
    var req = new XMLHttpRequest();
    var removeRow = this.nextSibling.value;
    var context = { "id": removeRow };
    req.open("POST", "/delete", true);
    req.setRequestHeader("Content-Type", "application/json");
    req.addEventListener("load", function () {
        if (req.status >= 200 && req.status < 400) {
            createTable(JSON.parse(req.responseText));
        }
        else {
            console.log("Error! " + req.statusText);
        }
    });
    req.send(JSON.stringify(context));
    event.preventDefault();
}

// edit row
function edit(event) {
    console.log(this.nextSibling.value);
    var row = this.parentElement.parentElement.parentElement;
    row.children[5].innerHTML = ''; // remove edit button
    var idx = "update";
    var id = this.nextSibling.value;
    var newCell = null;

    createButton(idx, newCell, row, id) // update button

    var name = document.createElement("input");
    name.setAttribute("id", "newName");
    name.setAttribute("type", "text");
    name.setAttribute("value", row.children[0].innerText);
    row.children[0].innerText = "";
    row.children[0].appendChild(name);

    var reps = document.createElement("input");
    reps.setAttribute("id", "newReps");
    reps.setAttribute("type", "number");
    reps.setAttribute("value", row.children[1].innerText);
    row.children[1].innerText = "";
    row.children[1].appendChild(reps);

    var weight = document.createElement("input");
    weight.setAttribute("id", "newWeight");
    weight.setAttribute("type", "number");
    weight.setAttribute("value", row.children[2].innerText);
    row.children[2].innerText = "";
    row.children[2].appendChild(weight);

    var units = document.createElement("select");
    units.setAttribute("id", "newUnit");

    var lbs = document.createElement("option");
    lbs.innerText = "lbs";
    lbs.setAttribute("value", "1")
    units.appendChild(lbs);

    var kgs = document.createElement("option");
    kgs.innerText = "kgs";
    kgs.setAttribute("value", "0")
    units.appendChild(kgs);

    if (row.children[3].innerText == "lbs") lbs.selected = true;
    else kgs.selected = true;

    row.children[3].innerText = "";
    row.children[3].appendChild(units);

    var date = document.createElement("input");
    date.setAttribute("id", "newDate");
    date.setAttribute("type", "date");
    date.setAttribute("value", row.children[4].innerText);

    row.children[4].innerText = "";
    row.children[4].appendChild(date);
}

// update edited row
function update(event) {
    var id = this.nextSibling.value;
    var context = { id: id };
    context.name = document.getElementById('newName').value;
    context.reps = document.getElementById('newReps').value;
    context.weight = document.getElementById('newWeight').value;
    context.unit = document.getElementById('newUnit').value;
    context.date = document.getElementById('newDate').value;
    req.open("POST", "/update", true);
    req.setRequestHeader('Content-Type', 'application/json');

    req.addEventListener('load', function () {
        if (req.status >= 200 && req.status < 400) {
            createTable(JSON.parse(req.responseText));
        }
        else {
            console.log("Error! " + req.statusText);
        }
    });
    req.send(JSON.stringify(context));
    event.preventDefault();
}
// function to create buttons (edit, delete, update)
function createButton(idx, newCell, newRow, row) {

    var button = document.createElement('input');
    button.setAttribute('type', "button");
    button.setAttribute('value', idx);
    button.setAttribute('class', idx);
    button.setAttribute('class', "btn btn-outline-primary")

    var form = document.createElement('form');
    var input = document.createElement('input');
    input.setAttribute('type', "hidden");
    form.appendChild(button);
    form.appendChild(input);

    if (idx === "update") {
        newRow.children[5].appendChild(form);
        input.setAttribute('value', row)
        button.addEventListener('click', update, false);
    } else {
        newCell.appendChild(form);
        newRow.appendChild(newCell);
        input.setAttribute('value', row['id'])
        if (idx === "edit") button.addEventListener('click', edit, false);
        else button.addEventListener('click', remove, false);
    }
};
// function to toggle lbs/kgs button with bootstrap
$(document).ready(function () {
    $("#myButton").click(function () {
        $(this).button('toggle');
    });
});