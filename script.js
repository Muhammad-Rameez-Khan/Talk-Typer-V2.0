document.addEventListener('DOMContentLoaded', () => {
    const speechButton = document.getElementById('speechButton');
    const transcribeButton = document.getElementById('transcribeButton');
    const transcription = document.getElementById('transcription');
    const notesList = document.getElementById('notesList');
    const clearHistoryButton = document.getElementById('clearHistoryButton');
    const manualInput = document.getElementById('manualInput');
    const addManualNoteButton = document.getElementById('addManualNoteButton');
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    let recognition;
    let notesHistory = JSON.parse(localStorage.getItem('notesHistory')) || [];
    let synth = window.speechSynthesis;

    // Load existing notes history from local storage
    if (notesHistory.length > 0) {
        renderNotesHistory();
    }

    speechButton.addEventListener('click', () => {
        if (!recognition) {
            recognition = new webkitSpeechRecognition() || new SpeechRecognition();
            recognition.lang = 'en-US';
            recognition.interimResults = true;
            recognition.maxAlternatives = 5;

            recognition.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript + ' ';
                    }
                }
                transcription.textContent = finalTranscript;
            };

            recognition.onend = () => {
                console.log('Speech recognition ended.');

                // Save transcription to notes history
                const timestamp = new Date().toLocaleString();
                const note = { timestamp, transcription: transcription.textContent };
                notesHistory.push(note);
                localStorage.setItem('notesHistory', JSON.stringify(notesHistory));
                renderNotesHistory();

                transcribeButton.disabled = false; // Enable transcribe button after recording ends
            };
        }
        recognition.start();
    });

    transcribeButton.addEventListener('click', () => {
        if (recognition) {
            recognition.stop();
            console.log('Stopped listening.');
            transcribeButton.disabled = true;
        }
    });

    clearHistoryButton.addEventListener('click', () => {
        const confirmation = confirm("Are you sure you want to clear the entire history?");
        if (confirmation) {
            clearHistory();
        }
    });

    addManualNoteButton.addEventListener('click', () => {
        const manualText = manualInput.value.trim();
        if (manualText !== '') {
            const timestamp = new Date().toLocaleString();
            const note = { timestamp, transcription: manualText };
            notesHistory.push(note);
            localStorage.setItem('notesHistory', JSON.stringify(notesHistory));
            renderNotesHistory();
            manualInput.value = ''; 
        }
    });

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('light-theme');
        body.classList.toggle('dark-theme');
    });

    function renderNotesHistory() {
        notesList.innerHTML = '';

        const reversedNotesHistory = notesHistory.slice().reverse();
        reversedNotesHistory.forEach((note, index) => {
            const li = document.createElement('li');
            const timestampSpan = document.createElement('span');
            timestampSpan.textContent = `${note.timestamp} - `;
            const noteContent = document.createElement('span');
            noteContent.textContent = note.transcription;

            // Create a container for buttons
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'button-container';

            // Share via Email button
            const shareButton = document.createElement('button');
            shareButton.textContent = 'Share';
            shareButton.addEventListener('click', () => {
                shareNote(note.transcription);
            });

            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.addEventListener('click', () => {
                editNoteContent(index, noteContent);
            });

            // Add a delete button to each note entry
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => {
                deleteNote(index);
            });

            // Add a speech button to read note aloud
            const speechButton = document.createElement('button');
            speechButton.textContent = 'Speak';
            speechButton.addEventListener('click', () => {
                speakNote(note.transcription);
            });

            buttonContainer.appendChild(shareButton);
            buttonContainer.appendChild(editButton);
            buttonContainer.appendChild(deleteButton);
            buttonContainer.appendChild(speechButton);

            li.appendChild(timestampSpan);
            li.appendChild(noteContent);
            li.appendChild(buttonContainer);
            notesList.appendChild(li);
        });
    }

    function editNoteContent(index, noteContent) {
        const newText = prompt('Enter new text:', noteContent.textContent);
        if (newText !== null) {
            notesHistory[index].transcription = newText;
            localStorage.setItem('notesHistory', JSON.stringify(notesHistory));
            noteContent.textContent = newText;
        }
    }

    function deleteNote(index) {
        const confirmation = confirm("Are you sure you want to delete this note?");
        if (confirmation) {
            notesHistory.splice(index, 1);
            localStorage.setItem('notesHistory', JSON.stringify(notesHistory));
            renderNotesHistory();
        }
    }

    function clearHistory() {
        localStorage.removeItem('notesHistory');
        notesHistory = [];
        renderNotesHistory();
    }

    function speakNote(text) {
        let utterance = new SpeechSynthesisUtterance(text);
        synth.speak(utterance);
    }

    function shareNote(noteContent) {
        const subject = 'Shared Note';
        const disclaimer = '\n\n---\n\nCopyright & Disclaimer: (This content was created and shared by a user of TalkTyper. We hold no responsibility for its accuracy, use, or misuse. Remember, User is solely responsible for this) TalkTyper Product of DigiTech MRK';
        const body = `${noteContent}\n\n${disclaimer}`;

        // Construct mailto URL
        const mailtoURL = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        // Construct WhatsApp URL
        const whatsappURL = `whatsapp://send?text=${encodeURIComponent(body)}`;

        // Ask the user how they want to share the note
        const shareOption = prompt('How would you like to share the note?\n1. Email\n2. Message\n3. WhatsApp');

        // Handle the user's choice
        switch (shareOption) {
            case '1':
                window.location.href = mailtoURL;
                break;
            case '2':
                // You would implement the logic for sharing via message here
                // Example: window.open('sms:?body=' + encodeURIComponent(body));
                alert('Sharing via message is not supported in this demo.');
                break;
            case '3':
                window.location.href = whatsappURL;
                break;
            default:
                alert('Invalid choice. Please select 1, 2, or 3.');
                break;
        }
    }
});
