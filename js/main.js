// Scrolling behavior

// window.sr = ScrollReveal({
//   duration: 800,
//   distance: '10px',
//   scale: .95
// });

// Hover states

var body = document.body;

function addClass(element, nameOfClass) {
	if (element.classList) {
 		element.classList.add(nameOfClass);
	}
	else {
		var regExp = new RegExp('(\\s|^)' + nameOfClass + '(\\s|$)');
		if (!element.className.match(regExp)) {
			element.className += " " + nameOfClass;
		}
	}
}

function removeClass(element, nameOfClass) {
	if (element.classList) {
		element.classList.remove(nameOfClass);
	}
	else {
		var regExp = new RegExp('(\\s|^)' + nameOfClass + '(\\s|$)');
		if (element.className.match(regExp)) {
			element.className.replace(regExp, ' ');
		}
	}
}

document.addEventListener('DOMContentLoaded', function() {
    const projects = document.querySelectorAll('a.starcount');
    projects.forEach(function(project) {
        const repoUrl = project.getAttribute('href');
        const match = repoUrl.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)/i);
        if (match) {
            const owner = match[1];
            const repo = match[2];
            fetch(`https://api.github.com/repos/${owner}/${repo}`)
                .then(response => response.json())
                .then(data => {
                    const stars = data.stargazers_count;
                    const boldTitle = project.querySelector('b');
                    if (boldTitle) {
                        const starText = document.createTextNode(` (${stars}★)`);
                        boldTitle.parentNode.insertBefore(starText, boldTitle.nextSibling);
                    }
                })
                .catch(error => console.error('Error fetching star count:', error));
        }
    });
});
