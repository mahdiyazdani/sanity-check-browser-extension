function domReady(callback) {
	if (typeof document === 'undefined') {
		return;
	}

	if (
		document.readyState === 'complete' || // DOMContentLoaded + Images/Styles/etc loaded, so we call directly.
		document.readyState === 'interactive' // DOMContentLoaded fires at this point, so we call directly.
	) {
		return void callback();
	}

	// DOMContentLoaded has not fired yet, delay callback until then.
	document.addEventListener('DOMContentLoaded', callback);
}

function renderSanityCheckList() {
	// Get the checklist from storage
	chrome.storage.sync.get(['checklist'], (result) => {
		const checklist = result.checklist || [];

		// Render the checklist
		const checklistList = document.getElementById('wpforms-sanity-check-list');
		checklist.forEach((taskObj) => {
			const taskText = taskObj.task;
			const isChecked = taskObj.checked;

			const li = document.createElement('li');
			const label = document.createElement('label');
			li.appendChild(label);
			const checkbox = document.createElement('input');
			checkbox.type = 'checkbox';
			checkbox.checked = isChecked; // Set the checkbox state
			label.appendChild(checkbox);
			label.appendChild(document.createTextNode(taskText));
			const deleteButton = document.createElement('button');
			deleteButton.innerHTML = '&times;';
			deleteButton.addEventListener('click', () => {
				const index = checklist.findIndex((item) => item.task === taskText);
				if (index !== -1) {
					checklist.splice(index, 1);
					chrome.storage.sync.set({ checklist: checklist }, () => {
						li.remove();
					});
				}
			});

			// Add event listener to save checkbox state changes
			checkbox.addEventListener('change', () => {
				const index = checklist.findIndex((item) => item.task === taskText);
				if (index !== -1) {
					checklist[index].checked = checkbox.checked;
					chrome.storage.sync.set({ checklist: checklist });
				}
			});

			li.appendChild(deleteButton);
			checklistList.appendChild(li);
		});
	});
}

domReady(() => {
	renderSanityCheckList();
	const $sanityCheckForm = document.getElementById('wpforms-sanity-check-extension');
	$sanityCheckForm.addEventListener('submit', (event) => {
		event.preventDefault();
		const $this = event.target;
		const formData = new FormData($this);
		const task = formData.get('task');
		const isChecked = formData.get('checkbox'); // Get the checkbox value

		// Get the checklist from storage
		chrome.storage.sync.get(['checklist'], (result) => {
			const checklist = result.checklist || [];
			checklist.push({ task: task, checked: isChecked }); // Save task and checkbox state

			chrome.storage.sync.set({ checklist: checklist }, () => {
				// Render the new checklist item
				const checklistList = document.getElementById('wpforms-sanity-check-list');
				const li = document.createElement('li');
				const label = document.createElement('label');
				li.appendChild(label);
				const checkbox = document.createElement('input');
				checkbox.type = 'checkbox';
				checkbox.checked = isChecked; // Set the checkbox state
				label.appendChild(checkbox);
				label.appendChild(document.createTextNode(task));
				const deleteButton = document.createElement('button');
				deleteButton.innerHTML = '&times;';
				deleteButton.addEventListener('click', () => {
					const index = checklist.findIndex((item) => item.task === task);
					if (index !== -1) {
						checklist.splice(index, 1);
						chrome.storage.sync.set({ checklist: checklist }, () => {
							li.remove();
						});
					}
				});

				// Add event listener to save checkbox state changes
				checkbox.addEventListener('change', () => {
					const index = checklist.findIndex((item) => item.task === task);
					if (index !== -1) {
						checklist[index].checked = checkbox.checked;
						chrome.storage.sync.set({ checklist: checklist });
					}
				});

				li.appendChild(deleteButton);
				checklistList.appendChild(li);
			});
		});

		$this.reset(); // Clear the form fields.
		return false;
	});
});
