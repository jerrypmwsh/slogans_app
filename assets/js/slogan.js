var base_url = "http://localhost:8080";
var categories = new Map();
var sources = new Map();
var count = 0;

function getSlogans() {
    return fetch(base_url + "/slogans",
        {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        })
        .then(response => response.json())
        .then(addToTable);
}

function getCategories() {
    return fetch(base_url + "/categories",
        {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        })
        .then(response => response.json())
        .then(json => {
            json.forEach(category => categories.set(category.id, category.category));
        });
}

function getSources() {
    return fetch(base_url + "/sources",
        {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        })
        .then(response => response.json())
        .then(json => {
            json.forEach(source => sources.set(source.id, source.source));
        });
}

function addToTable(slogans) {
    var table = document.getElementById('id_slogans');
    slogans.forEach(sloganObj => {
        var row = table.insertRow();
        var id = row.insertCell();
        var slogan = row.insertCell();
        var company = row.insertCell();
        var category = row.insertCell();
        var source = row.insertCell();
        var sourceInfo = row.insertCell();
        var editBtn = row.insertCell();

        id.innerHTML = sloganObj.id;
        slogan.innerHTML = sloganObj.slogan;
        company.innerHTML = sloganObj.company;
        category.innerHTML = categories.get(sloganObj.categoryId);
        source.innerHTML = sources.get(sloganObj.sourceId);
        sourceInfo.innerHTML = sloganObj.sourceInfo;
        editBtn.innerHTML = "<button id=\"id_edit\" type=\"image\" class=\"btn btn-default\" onclick=\"alert('edits')\">edit</button><button id=\"id_del\" type=\"image\" class=\"btn btn-default\" onclick=\"deleteSlogan(this)\">del</button>"

        count++;
    });
}

function addSlogan() {
    var form = $("#id_add")
    var slogan = {};
    form.serializeArray().forEach(entry => slogan[entry.name] = entry.value);
    var category = slogan.categoryId
    var source = slogan.sourceId
    slogan.categoryId = getIdFromMap(categories, category);
    slogan.sourceId = getIdFromMap(sources, source);

    fetch(base_url + '/slogans',
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            },
            body: JSON.stringify(slogan)
        })
        .then(response => response.text())
        .then(text => {
            slogan.id = text
            // TODO: Fix this category(Id)/source(Id) swapping ugliness
            slogan.categoryId = category
            slogan.sourceId = source
            var fr = $("#id_slogans tr:first");
            fr.after(toRow(slogan));
            renderCount(++count)
        });
    
    form[0].reset();
    return false;
}

function deleteSlogan(delButton) {
    if (!confirm("Are you sure you want to delete?")) {
        return
    }
    var rowId = delButton.parentNode.parentNode.rowIndex
    var sloganId = $(`#id_slogans tr:eq(${rowId}) td:first`).html()

    fetch(base_url + '/slogans/' + sloganId,
        {
            method: "DELETE",
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        })
        .then(response => {
            var table = document.getElementById('id_slogans');
            table.deleteRow(rowId)
            renderCount(--count)
        })

}

function getIdFromMap(map, value) {
    return Array.from(map.entries())
        .find(entry => entry[1] === value)
    [0];
}

function toRow(slogan) {
    return `<tr><td>${slogan.id}</td><td>${slogan.slogan}</td><td>${slogan.company}</td><td>${slogan.categoryId}</td><td>${slogan.sourceId}</td><td>${slogan.sourceInfo}</td><td><button id=\"id_edit\" type=\"image\" class=\"btn btn-default\" onclick=\"alert('edits')\">edit</button><button id=\"id_del\" type=\"image\" class=\"btn btn-default\" onclick=\"deleteSlogan(this)\">del</button></td></tr>`;
}

function addOptions() {
    var category_select = $("#id_category_select");
    Array.from(categories.values())
        .forEach(category => addOption(category_select, category));

    var source_select = $("#id_source_select");
    Array.from(sources.values())
        .forEach(source => addOption(source_select, source));
}

function addOption(select, text) {
    var option = document.createElement("option");
    option.text = text;
    select.append(option);
}

var timer;
function delayedFilterRows() {
    clearTimeout(timer);
    timer = setTimeout(filterRows, 1000);
}

function filterRows() {
    var filter = $("#id_search").val();
    hideRows(filter.toUpperCase());
    $("#id_footer").text(`Slogans count: ${count}`);
}

function hideRows(filter) {
    var table = document.getElementById('id_slogans');
    var tr = table.getElementsByTagName("tr");

    var column = "";
    var text = filter;
    if (filter.indexOf(":") > -1) {
        var parts = filter.split(":");
        column = parts[0];
        text = parts[1];
    }
    var col;
    switch (column.toUpperCase()) {
        case "ID":
            col = 0;
            break;
        case "COMPANY":
            col = 2;
            break;
        case "CATEGORY":
            col = 3;
            break;
        case "SOURCE":
            col = 4;
            break;
        case "SOURCEINFO":
            col = 5;
            break;
        case "SLOGAN":
        default:
            col = 1;
    }
    count = 0;
    for (i = 1; i < tr.length; i++) {
        var td = tr[i].getElementsByTagName("td")[col];
        if (td) {
            if (td.innerHTML.toUpperCase().indexOf(text) > -1) {
                count++;
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

function displayProfile() {
  // display the profile
  var buttons = document.getElementById("id_logout");
  var pic = localStorage.getItem('picture');
  buttons.innerHTML = `<img src="${pic}" />`;
}

function renderCount(num) {
    $("#id_footer").text(`Slogans Count: ${num}`)
}

$(function () {
    if (!isAuthenticated()) {
        window.location.replace("/");
    }
    getCategories()
        .then(getSources)
        .then(getSlogans)
        .then(() => $("#id_footer").text(`Slogans Count: ${count}`))
        .then(addOptions);
});