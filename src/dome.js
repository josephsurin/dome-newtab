var search = "https://duckduckgo.com/"		// The search engine
var query  = "q"				// The query variable name for the search engine

var pivotmatch = 0
var totallinks = 0
var prevregexp = ""
var openinnew = 0

// ---------- BUILD PAGE ----------
function matchLinks(regex = prevregexp) {
    var sites = JSON.parse(window.localStorage.getItem("sites") || "{}")
	totallinks = 0
	pivotmatch = regex == prevregexp ? pivotmatch : 0
	prevregexp = regex
	pivotbuffer = pivotmatch
	p = document.getElementById("links")
	while (p.firstChild) {
		p.removeChild(p.firstChild)
	}
	match = new RegExp(regex ? regex : ".", "i")
	gmatches = false // kinda ugly, rethink
	for (i = 0; i < Object.keys(sites).length; i++) {
		matches = false
		sn = Object.keys(sites)[i]
		section = document.createElement("div")
		section.id = sn
        section.style.position = "relative"
        sectionDel = document.createElement("span")
        sectionDel.innerHTML = "delete"
        sectionDel.setAttribute("section", sn)
        sectionDel.style.position = "absolute"
        sectionDel.style.right = "5px"
        sectionDel.addEventListener("click", function(e) {
            var sn = this.getAttribute("section")
            var conf = confirm("Are you sure you want to delete " + sn + "?")
            if(conf) {
                delete sites[sn]
                window.localStorage.setItem("sites", JSON.stringify(sites))
                matchLinks()
            }
        })
        sectionTitle = document.createElement("span")
		sectionTitle.innerHTML = sn
        sectionTitle.addEventListener("click", function(e) {
            var [n, l] = prompt("Add new named link, separating the name and link by a space. e.g: facebook https://facebook.com").split(' ')
            sites[this.innerText][n] = l
            window.localStorage.setItem("sites", JSON.stringify(sites))
            matchLinks()
        })
        section.appendChild(sectionTitle)
        section.appendChild(sectionDel)
		section.className = "section"
		inner = document.createElement("div")
		for (l = 0; l < Object.keys(sites[sn]).length; l++) {
			ln = Object.keys(sites[sn])[l]
			if (match.test(ln)) {
				link = document.createElement("a")
				link.href = sites[sn][ln]
				link.innerHTML = ln
				if (!pivotbuffer++ && regex != "") {
					link.className = "selected"
					var actionEl = document.getElementById("action")
					actionEl.action = sites[sn][ln]
					actionEl.children[0].removeAttribute("name")
				}
				inner.appendChild(link)
				matches = true
				gmatches = true
				totallinks++
			}
		}
		section.appendChild(inner)
        if(matches || Object.keys(sites[sn]).length == 0) p.appendChild(section)
	}
    if(!regex) { //add new bookmark buttons
        var section = document.createElement("div")    
        section.className = "section"
        section.innerHTML = "<center>add new section</center>"
        section.addEventListener("click", function (e) {
            var sectionName = prompt("Enter a name for the new section: ")
            if(sites[sectionName]) {
                alert("A section with that name already exists.")
            } else {
                sites[sectionName] = {}
                window.localStorage.setItem('sites', JSON.stringify(sites))
                matchLinks()
            }
        })
        p.appendChild(section)
    }
	if (!gmatches || regex == "") {
		document.getElementById("action").action = search
		document.getElementById("action").children[0].name = query
	}
	document.getElementById("main").style.height = document.getElementById("main").children[0].offsetHeight+"px"
}

document.onkeydown = function(e) {
	switch (e.keyCode) {
		case 16:
			openinnew ^= 1 // toggle open in new tab
			var actionEl = document.getElementById("action")
			var displayEl = document.getElementById("shift-state")
			if(openinnew) {
				actionEl.setAttribute("target", "_blank")
				displayEl.innerText = "open in new tab"
			} else {
				actionEl.setAttribute("target", "_self")
				displayEl.innerText = "open here"
			}
			break
		case 38:
			pivotmatch = pivotmatch >= 0 ? 0 : pivotmatch + 1
			matchLinks()
			break
		case 40:
			pivotmatch = pivotmatch <= -totallinks + 1 ? -totallinks + 1 : pivotmatch - 1
			matchLinks()
			break
		default:
			break
	}
	document.getElementById("action").children[0].focus()
}

document.getElementById("action").children[0].onkeypress = function(e) {
	if (e.key == "ArrowDown" || e.key == "ArrowUp") {
		return false
	}
}

function displayClock() {
	now = new Date()
	clock = (now.getHours() < 10 ? "0"+now.getHours() : now.getHours())+":"
			+(now.getMinutes() < 10 ? "0"+now.getMinutes() : now.getMinutes())+":"
			+(now.getSeconds() < 10 ? "0"+now.getSeconds() : now.getSeconds())
	document.getElementById("clock").innerHTML = clock
}

window.onload = matchLinks()
displayClock()
setInterval(displayClock, 1000)
