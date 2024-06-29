
// DRAGGABLE INTERFACT

function makeDraggable(draggableContainer) {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    draggableContainer.addEventListener("mousedown", dragStart);
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", dragEnd);

    function dragStart(e) {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
        isDragging = true;
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, draggableContainer);
        }
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }
}



function parseTime(timeString) {
    const [minutes, seconds] = timeString.split(':');
    return parseInt(minutes) * 60 + parseInt(seconds);
}
function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}


// UI COMPONENTS

const createButton = (text, onClick = null) => {
    const button = document.createElement('button');
    button.innerText = text;
    button.style.fontSize = '16px';
    button.style.padding = '10px 20px';
    button.style.margin = '5px';
    button.style.borderRadius = '5px';
    button.style.border = 'none';
    button.style.backgroundColor = '#4CAF50';
    button.style.color = 'white';
    button.style.cursor = 'pointer';
    button.style.flex = '1';
    button.style.fontWeight = 'bold';
    if (onClick) {
        button.addEventListener('click', onClick)
    }
    return button;
};


function createControlContainer(labelText) {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.marginBottom = '10px';
    container.style.fontSize = '16px';
    const label = document.createElement('label');
    label.textContent = labelText;
    label.style.marginRight = '10px';

    container.appendChild(label);
    return container;
}

function createToggleSwitch(checked) {
    const toggleSwitch = document.createElement('input');
    toggleSwitch.type = 'checkbox';
    toggleSwitch.style.width = '40px';
    toggleSwitch.style.height = '20px';
    toggleSwitch.checked = checked;
    return toggleSwitch;
}

function createSlider(labelText, min, max, value) {
    const container = createControlContainer(labelText);

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = min;
    slider.max = max;
    slider.value = value;
    slider.style.width = '100%';

    container.appendChild(slider);
    return container;
}


function createPersistentCanvas(video) {
    const videoRect = video.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    canvas.width = videoRect.width;
    canvas.height = videoRect.height;
    canvas.style.position = 'absolute';
    canvas.style.left = `${videoRect.left}px`;
    canvas.style.top = `${videoRect.top}px`;
    canvas.style.zIndex = '1000';
    canvas.style.pointerEvents = 'none'; // Allow clicks to pass through to the video
    document.body.appendChild(canvas);
    return canvas;
}


// FOCUS MODEL

function createFocusSection(video, index) {
    let isFocusModeEnabled = false;
    let isRecording = false;
    let isPlayingBack = false;
    let recordingStartTime = 0;
    let recordingInterval = null;
    let mouseCoordinates = [];
    let recordings = []; // Store all recordings
    const focusSection = document.createElement('div');
    focusSection.className = `focus-section-${index}`;

    const focusModeContainer = createControlContainer('Focus Mode:');
    const focusModeSwitch = createToggleSwitch(isFocusModeEnabled);
    focusModeContainer.appendChild(focusModeSwitch);
    focusSection.appendChild(focusModeContainer);

    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    canvas.style.display = 'none';
    document.body.appendChild(canvas);

    const debugPointer = document.createElement('div');
    debugPointer.style.position = 'fixed';
    debugPointer.style.width = '20px';
    debugPointer.style.height = '20px';
    debugPointer.style.borderRadius = '50%';
    debugPointer.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
    debugPointer.style.border = '2px solid red';
    debugPointer.style.pointerEvents = 'none';
    debugPointer.style.zIndex = '10000';
    debugPointer.style.display = 'none';
    document.body.appendChild(debugPointer);

    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'space-between';
    buttonContainer.style.marginBottom = '10px';

    const recordButton = createButton('Record Focus', startCountdown);
    buttonContainer.appendChild(recordButton);

    const importButton = createButton('Import Recordings', importRecordings);
    buttonContainer.appendChild(importButton);

    focusSection.appendChild(buttonContainer);

    const overlayContainer = document.createElement('div');
    overlayContainer.style.position = 'fixed';
    overlayContainer.style.top = '0';
    overlayContainer.style.left = '0';
    overlayContainer.style.width = '100%';
    overlayContainer.style.height = '100%';
    overlayContainer.style.display = 'flex';
    overlayContainer.style.justifyContent = 'center';
    overlayContainer.style.alignItems = 'center';
    overlayContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlayContainer.style.zIndex = '10001';
    overlayContainer.style.display = 'none';
    document.body.appendChild(overlayContainer);

    const overlayText = document.createElement('div');
    overlayText.style.fontSize = '100px';
    overlayText.style.color = 'white';
    overlayContainer.appendChild(overlayText);

    const recordingOverlay = document.createElement('div');
    recordingOverlay.style.position = 'fixed';
    recordingOverlay.style.top = '10px';
    recordingOverlay.style.left = '50%';
    recordingOverlay.style.transform = 'translateX(-50%)';
    recordingOverlay.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
    recordingOverlay.style.color = 'white';
    recordingOverlay.style.padding = '10px';
    recordingOverlay.style.borderRadius = '5px';
    recordingOverlay.style.zIndex = '10001';
    recordingOverlay.style.display = 'none';
    recordingOverlay.textContent = 'Recording... Press Esc to stop';
    document.body.appendChild(recordingOverlay);

    const recordingList = document.createElement('div');
    recordingList.style.marginTop = '10px';
    focusSection.appendChild(recordingList);

    function toggleFocusMode(event) {
        isFocusModeEnabled = event.target.checked;
        canvas.style.display = isFocusModeEnabled ? 'block' : 'none';
        debugPointer.style.display = isFocusModeEnabled ? 'block' : 'none';
        if (isFocusModeEnabled) {
            document.addEventListener('mousemove', updateFocusArea);
        } else {
            document.removeEventListener('mousemove', updateFocusArea);
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    function updateFocusArea(event) {
        if (isPlayingBack) return;

        const x = event.clientX;
        const y = event.clientY;

        updateFocusAreaWithCoordinates(x, y);
    }

    function updateFocusAreaWithCoordinates(x, y) {
        debugPointer.style.left = `${x - 10}px`;
        debugPointer.style.top = `${y - 10}px`;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const gradient = ctx.createRadialGradient(x, y, 50, x, y, 300);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function startCountdown() {
        if (!isFocusModeEnabled) {
            focusModeSwitch.checked = true;
            toggleFocusMode({ target: focusModeSwitch });
        }

        video.pause();
        let count = 3;
        overlayContainer.style.display = 'flex';
        overlayText.textContent = count;

        const countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                overlayText.textContent = count;
            } else {
                clearInterval(countdownInterval);
                overlayContainer.style.display = 'none';
                startRecording();
            }
        }, 1000);
    }

    function startRecording() {
        if (!isRecording) {
            isRecording = true;
            recordingStartTime = video.currentTime;
            mouseCoordinates = [];
            recordingOverlay.style.display = 'block';
            recordButton.textContent = 'Stop Recording';
            recordButton.style.backgroundColor = 'red';
            video.play();

            recordingInterval = setInterval(() => {
                const videoRect = video.getBoundingClientRect();
                const x = debugPointer.offsetLeft - videoRect.left;
                const y = debugPointer.offsetTop - videoRect.top;
                mouseCoordinates.push({ time: video.currentTime - recordingStartTime, x, y });
            }, 1000);

            document.addEventListener('keydown', stopRecordingOnEsc);
        } else {
            stopRecording();
        }
    }

    function stopRecordingOnEsc(event) {
        if (event.key === 'Escape') {
            if (isRecording) {
                stopRecording();
            } else if (isPlayingBack || isFocusModeEnabled) {
                exitFocusMode()
            }
        }
    }

    function stopRecording() {
        if (isRecording) {
            isRecording = false;
            clearInterval(recordingInterval);
            recordingOverlay.style.display = 'none';
            recordButton.textContent = 'Record Focus';
            recordButton.style.backgroundColor = '#4CAF50';
            document.removeEventListener('keydown', stopRecordingOnEsc);

            const recordingEndTime = video.currentTime;
            addRecordingToList(recordingStartTime, recordingEndTime);
        }
    }

    function addRecordingToList(startTime, endTime) {
        const recording = {
            startTime,
            endTime,
            coordinates: mouseCoordinates
        };
        recordings.push(recording);
        updateRecordingList();
    }

    function updateRecordingList() {
        recordingList.innerHTML = '';
        recordings.forEach((recording, index) => {
            const recordingItem = createRecordingItem(recording, index);
            recordingList.appendChild(recordingItem);
        });
    }

    function createRecordingItem(recording, index) {
        const recordingItem = document.createElement('div');
        recordingItem.style.fontSize = '18px';
        recordingItem.style.marginBottom = '10px';
        recordingItem.style.display = 'flex';
        recordingItem.style.alignItems = 'center';
        recordingItem.style.justifyContent = 'space-between';

        const timeText = document.createElement('span');
        timeText.textContent = `${formatTime(recording.startTime)} - ${formatTime(recording.endTime)}`;
        timeText.style.marginRight = '10px';
        recordingItem.appendChild(timeText);

        const buttonContainer = document.createElement('div');

        const playButton = createButton('Play', () => playRecording(recording.startTime, recording.endTime));
        playButton.style.marginRight = '5px';
        buttonContainer.appendChild(playButton);

        const deleteButton = createButton('Delete', () => {
            recordings.splice(index, 1);
            updateRecordingList();
        });
        deleteButton.style.backgroundColor = 'red';
        buttonContainer.appendChild(deleteButton);

        recordingItem.appendChild(buttonContainer);
        return recordingItem;
    }

    function playRecording(startTime, endTime) {
        isPlayingBack = true;
        if (!isFocusModeEnabled) {
            focusModeSwitch.checked = true;
            toggleFocusMode({ target: focusModeSwitch });
        }

        video.currentTime = startTime;
        video.play();

        const recording = recordings.find(r => r.startTime === startTime && r.endTime === endTime);
        const playbackCoordinates = recording ? recording.coordinates : [];
        let coordIndex = 0;

        const playInterval = setInterval(() => {
            if (video.currentTime >= endTime || coordIndex >= playbackCoordinates.length) {
                clearInterval(playInterval);
                video.pause();
                isPlayingBack = false;
                return;
            }

            const currentCoord = playbackCoordinates[coordIndex];
            const videoRect = video.getBoundingClientRect();
            const x = videoRect.left + currentCoord.x;
            const y = videoRect.top + currentCoord.y;

            updateFocusAreaWithCoordinates(x, y);
            coordIndex++;
        }, 1000);

        document.addEventListener('keydown', stopRecordingOnEsc);
    }

    function exitFocusMode() {
        isPlayingBack = false;
        isFocusModeEnabled = false;
        focusModeSwitch.checked = false;
        toggleFocusMode({ target: focusModeSwitch });
        document.removeEventListener('keydown', stopRecordingOnEsc);
    }

    function formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function importRecordings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.style.display = 'none';

        input.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedData = JSON.parse(e.target.result);
                        if (importedData.focusRecordings) {
                            recordings = importedData.focusRecordings;
                            updateRecordingList();
                            alert('Focus recordings imported successfully!');
                        } else {
                            alert('No focus recordings found in the imported file.');
                        }
                    } catch (error) {
                        console.error('Error importing focus recordings:', error);
                        alert('Error importing focus recordings. Please check the file format.');
                    }
                };
                reader.readAsText(file);
            }
        });

        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    }

    // Event listener for focus mode toggle
    focusModeSwitch.addEventListener('change', toggleFocusMode);
    document.addEventListener('keydown', stopRecordingOnEsc);

    // Add a method to get the recordings
    function getRecordings() {
        return recordings;
    }

    // Expose the getRecordings method
    focusSection.getRecordings = getRecordings;

    return focusSection;
}

// SETTINGS PAGE
function createSettingsSection(video, index, sectionIds) {
    const settingsSection = document.createElement('div');
    settingsSection.style.display = 'flex';
    settingsSection.style.flexDirection = 'column';
    settingsSection.style.alignItems = 'center';
    settingsSection.style.padding = '10px';

    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'center';
    buttonContainer.style.width = '100%';
    buttonContainer.style.marginBottom = '20px';

    const exportButton = createButton('Export Configurations');

    exportButton.style.marginLeft = '10px';

    buttonContainer.appendChild(exportButton);

    settingsSection.appendChild(buttonContainer);
    exportButton.addEventListener('click', () => exportConfigurations(video, index, sectionIds));

    return settingsSection;
}

function exportConfigurations(video, index, sectionIds) {
    const config = {
        timestamps: getTimestamps(index),
        audioSettings: getAudioSettings(index),
        videoSettings: getVideoSettings(index),
        annotations: getAnnotations(index),
        focusRecordings: getFocusRecordings(index)
    };

    // Prompt the user for a file name
    const fileName = prompt("Enter a name for your configuration file:", "video_config");

    // If the user cancels the prompt, fileName will be null
    if (fileName === null) {
        return; // Exit the function if the user cancels
    }

    // Ensure the file name ends with .json
    const safeFileName = fileName.endsWith('.json') ? fileName : `${fileName}.json`;

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = safeFileName;
    a.style.display = 'none';

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function getFocusRecordings(index) {
    const focusSection = document.querySelector(`.focus-section-${index}`);
    return focusSection && focusSection.getRecordings ? focusSection.getRecordings() : [];
}

function getAnnotations(index) {
    const annotationElements = document.querySelectorAll(`[class^="annotation-list-"]`);
    const annotations = Array.from(annotationElements).map(element => {
        const nameInput = element.querySelector('input[type="text"]');
        const startTimeInput = element.querySelectorAll('input[type="text"]')[1];
        const endTimeInput = element.querySelectorAll('input[type="text"]')[2];
        const imageBase64 = element.dataset.imageBase64;
        return {
            name: nameInput.value,
            startTime: convertToSeconds(startTimeInput.value),
            endTime: convertToSeconds(endTimeInput.value),
            imageBase64: imageBase64
        };
    });

    return annotations;
}
// ANNOTATION SECTION
function createAnnotationSection(video, index) {
    const existingControls = document.querySelector(`.video-controls-wrapper-${index}`);





    const annotationSection = document.createElement('div');
    annotationSection.style.pointerEvents = 'auto';
    console.log(existingControls)
    const toggleContainer = createControlContainer('Display Annotations:');
    const toggleSwitch = createToggleSwitch(false);
    toggleContainer.appendChild(toggleSwitch);
    annotationSection.appendChild(toggleContainer);



    const persistentCanvas = createPersistentCanvas(video);
    persistentCanvas.style.display = 'none'; // Hide by default

    const drawButton = createButton('Draw on Video', () => {
        video.pause();
        existingControls.style.display = "none"

        enableDrawing(video);
    });
    annotationSection.appendChild(drawButton);

    const importButton = createButton('Import Annotation');
    importButton.addEventListener('click', () => importConfigurations(video, index));
    function importConfigurations(video, index) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.style.display = 'none';

        input.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const config = JSON.parse(e.target.result);
                        updateAnnotationList(config.annotations);


                        alert('Annotations imported successfully!');
                    } catch (error) {
                        console.error('Error importing configurations:', error);
                        alert('Error importing configurations. Please check the file format.');
                    }
                };
                reader.readAsText(file);
            }
        });

        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    }
    annotationSection.appendChild(importButton);





    const annotationList = document.createElement('div');
    annotationList.style.maxHeight = '200px';
    annotationList.style.overflowY = 'auto';
    annotationList.style.marginTop = '10px';
    annotationSection.appendChild(annotationList);

    let annotations = [];
    let shapes = [];
    let selectedShape = null;
    let isDrawing = false;
    let isDragging = false;
    let isResizing = false;
    let startX, startY;
    let color = '#000000';
    let lineWidth = 2;
    let tool = 'pencil';
    let mode = 'draw';
    let cursorX, cursorY;

    function enableDrawing(video) {
        const videoRect = video.getBoundingClientRect();
        shapes = [];

        // Create overlay
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.left = `${videoRect.left}px`;
        overlay.style.top = `${videoRect.top}px`;
        overlay.style.width = `${videoRect.width}px`;
        overlay.style.height = `${videoRect.height}px`;
        overlay.style.zIndex = '999';
        document.body.appendChild(overlay);

        const canvas = document.createElement('canvas');
        canvas.width = videoRect.width;
        canvas.height = videoRect.height;
        canvas.style.position = 'absolute';
        canvas.style.left = `${videoRect.left}px`;
        canvas.style.top = `${videoRect.top}px`;
        canvas.style.zIndex = '1000';
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const drawingControls = createDrawingControls();
        document.body.appendChild(drawingControls);

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mousemove', updateCursor);

        function createDrawingControls() {
            const controls = document.createElement('div');
            controls.style.position = 'absolute';
            controls.style.top = `${videoRect.bottom + 10}px`;
            controls.style.left = `${videoRect.left}px`;
            controls.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            controls.style.padding = '10px';
            controls.style.borderRadius = '5px';
            controls.style.zIndex = '1001';

            const colorPicker = document.createElement('input');
            colorPicker.type = 'color';
            colorPicker.value = color;
            colorPicker.addEventListener('input', (e) => {
                color = e.target.value;
                if (selectedShape) {
                    selectedShape.color = color;
                    redrawCanvas();
                }
            });
            controls.appendChild(colorPicker);

            const brushSize = document.createElement('input');
            brushSize.type = 'range';
            brushSize.min = '1';
            brushSize.max = '20';
            brushSize.value = lineWidth;
            brushSize.addEventListener('input', (e) => {
                lineWidth = parseInt(e.target.value);
                if (selectedShape) {
                    selectedShape.lineWidth = lineWidth;
                    redrawCanvas();
                }
            });
            controls.appendChild(brushSize);

            const tools = ['pencil', 'rectangle', 'circle'];
            tools.forEach(toolName => {
                const button = createButton(toolName.charAt(0).toUpperCase() + toolName.slice(1), () => {
                    tool = toolName;
                    mode = 'draw';
                    selectedShape = null;
                    updateActiveToolIndicator();
                });
                button.id = `tool-${toolName}`;
                controls.appendChild(button);
            });

            const modeButtons = ['edit', 'delete'];
            modeButtons.forEach(modeName => {
                const button = createButton(modeName.charAt(0).toUpperCase() + modeName.slice(1), () => {
                    mode = modeName;
                    updateActiveToolIndicator();
                });
                button.id = `mode-${modeName}`;
                controls.appendChild(button);
            });



            const uploadImageButton = createButton('Upload Image', () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.style.display = 'none';

                input.addEventListener('change', (event) => {
                    const file = event.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const image = new Image();
                            image.onload = () => {
                                const imageShape = {
                                    type: 'image',
                                    x: canvas.width / 2 - image.width / 2,
                                    y: canvas.height / 2 - image.height / 2,
                                    width: image.width,
                                    height: image.height,
                                    image: image
                                };
                                shapes.push(imageShape);
                                redrawCanvas();
                            };
                            image.src = e.target.result;
                        };
                        reader.readAsDataURL(file);
                    }
                });

                document.body.appendChild(input);
                input.click();
                document.body.removeChild(input);
            });
            uploadImageButton.id = 'tool-uploadimage';
            controls.appendChild(uploadImageButton);


            const textRow = document.createElement('div');
            textRow.style.marginTop = '10px';

            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.placeholder = 'Enter text';
            textRow.appendChild(textInput);

            const addTextButton = createButton('Add Text', () => {
                if (textInput.value) {
                    ctx.font = `${lineWidth * 5}px Arial`;
                    const metrics = ctx.measureText(textInput.value);
                    const textShape = {
                        type: 'text',
                        x: canvas.width / 2,
                        y: canvas.height / 2,
                        text: textInput.value,
                        color: color,
                        fontSize: lineWidth * 5,
                        width: metrics.width,
                        height: lineWidth * 5
                    };
                    shapes.push(textShape);
                    redrawCanvas();
                    textInput.value = '';
                }
            });
            textRow.appendChild(addTextButton);

            const saveButton = createButton('Save', () => {
                saveAnnotation();
                closeDrawingMode();

            });
            textRow.appendChild(saveButton);

            const backButton = createButton('Back', closeDrawingMode);
            textRow.appendChild(backButton);

            controls.appendChild(textRow);
            makeDraggable(controls)
            return controls;
        }


        function updateActiveToolIndicator() {
            const allButtons = [...document.querySelectorAll('[id^="tool-"]'), ...document.querySelectorAll('[id^="mode-"]')];
            allButtons.forEach(button => {
                button.style.backgroundColor = '#4CAF50';
                button.style.color = 'white';
            });

            if (mode === 'draw') {
                const activeButton = document.getElementById(`tool-${tool}`);
                if (activeButton) {
                    activeButton.style.backgroundColor = '#45a049';
                    activeButton.style.color = 'white';
                }
            } else {
                const activeButton = document.getElementById(`mode-${mode}`);
                if (activeButton) {
                    activeButton.style.backgroundColor = '#45a049';
                    activeButton.style.color = 'white';
                }
            }
        }

        function updateCursor(e) {
            const rect = canvas.getBoundingClientRect();
            cursorX = e.clientX - rect.left;
            cursorY = e.clientY - rect.top;
            redrawCanvas();
        }

        function handleMouseDown(e) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (mode === 'draw') {
                isDrawing = true;
                startX = x;
                startY = y;

                if (tool === 'pencil') {
                    shapes.push({
                        type: 'path',
                        color: color,
                        lineWidth: lineWidth,
                        points: [[x, y]],
                        x: x,
                        y: y,
                        width: 1,
                        height: 1
                    });
                } else {
                    shapes.push({
                        type: tool,
                        x: x,
                        y: y,
                        width: 0,
                        height: 0,
                        color: color,
                        lineWidth: lineWidth
                    });
                }
            } else if (mode === 'edit' || mode === 'delete') {
                // Find all shapes that contain the clicked point
                const clickedShapes = shapes.filter(shape => isPointInShape(x, y, shape));

                // Select the topmost shape (last in the array)
                selectedShape = clickedShapes[clickedShapes.length - 1];

                if (selectedShape) {
                    if (mode === 'edit') {
                        isDragging = true;
                        isResizing = isPointInResizeHandle(x, y, selectedShape);
                        startX = x;
                        startY = y;
                    } else if (mode === 'delete') {
                        deleteSelectedShape();
                    }
                }
            }
            redrawCanvas();
        }

        function isPointInResizeHandle(x, y, shape) {
            const handleSize = 10;
            return x >= shape.x + shape.width - handleSize &&
                x <= shape.x + shape.width &&
                y >= shape.y + shape.height - handleSize &&
                y <= shape.y + shape.height;
        }

        function handleMouseMove(e) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (isDrawing && mode === 'draw') {
                const currentShape = shapes[shapes.length - 1];
                if (tool === 'pencil') {
                    currentShape.points.push([x, y]);
                    currentShape.x = Math.min(currentShape.x, x);
                    currentShape.y = Math.min(currentShape.y, y);
                    currentShape.width = Math.max(currentShape.width, x - currentShape.x);
                    currentShape.height = Math.max(currentShape.height, y - currentShape.y);
                } else {
                    currentShape.width = x - currentShape.x;
                    currentShape.height = y - currentShape.y;
                }
            } else if (isDragging && mode === 'edit' && selectedShape) {
                if (isResizing) {
                    const newWidth = x - selectedShape.x;
                    const newHeight = y - selectedShape.y;
                    const scaleX = newWidth / selectedShape.width;
                    const scaleY = newHeight / selectedShape.height;

                    if (selectedShape.type === 'circle' || selectedShape.type === 'text') {
                        // Maintain aspect ratio for circles and text
                        if (Math.abs(newWidth) > Math.abs(newHeight)) {
                            selectedShape.width = newWidth;
                            selectedShape.height = newWidth / aspectRatio;
                        } else {
                            selectedShape.height = newHeight;
                            selectedShape.width = newHeight * aspectRatio;
                        }
                    } else {
                        selectedShape.width = newWidth;
                        selectedShape.height = newHeight;
                    }

                    if (selectedShape.type === 'path') {
                        selectedShape.points = selectedShape.points.map(point => [
                            selectedShape.x + (point[0] - selectedShape.x) * scaleX,
                            selectedShape.y + (point[1] - selectedShape.y) * scaleY
                        ]);
                    } else if (selectedShape.type === 'text') {
                        selectedShape.fontSize *= Math.sqrt(scaleX * scaleY); // Use geometric mean for smoother scaling
                    }
                } else {
                    const dx = x - startX;
                    const dy = y - startY;
                    selectedShape.x += dx;
                    selectedShape.y += dy;
                    if (selectedShape.type === 'path') {
                        selectedShape.points = selectedShape.points.map(point => [point[0] + dx, point[1] + dy]);
                    }
                }
                startX = x;
                startY = y;
            }

            redrawCanvas();
        }

        function handleMouseUp() {
            isDrawing = false;
            isDragging = false;
            isResizing = false;
        }

        function isPointInShape(x, y, shape) {
            if (shape.type === 'path') {
                return shape.points.some(point =>
                    Math.abs(point[0] - x) < 5 && Math.abs(point[1] - y) < 5
                );
            } else if (shape.type === 'image') {
                return x >= shape.x && x <= shape.x + shape.width &&
                    y >= shape.y && y <= shape.y + shape.height;
            }
            return x >= shape.x && x <= shape.x + shape.width &&
                y >= shape.y && y <= shape.y + shape.height;
        }

        function deleteSelectedShape() {
            const index = shapes.indexOf(selectedShape);
            if (index > -1) {
                shapes.splice(index, 1);
            }
            selectedShape = null;
            redrawCanvas();
        }

        function redrawCanvas() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            shapes.forEach((shape, index) => {
                drawShape(shape);

                // Draw bounding box for selected shape
                if (shape === selectedShape && mode === 'edit') {
                    drawBoundingBox(shape);
                }
            });

            // Draw cursor point
            ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.arc(cursorX, cursorY, 3, 0, 2 * Math.PI);
            ctx.fill();
        }

        function drawShape(shape) {
            ctx.strokeStyle = shape.color;
            ctx.fillStyle = shape.color;
            ctx.lineWidth = shape.lineWidth;

            switch (shape.type) {
                case 'path':
                    ctx.beginPath();
                    ctx.moveTo(shape.points[0][0], shape.points[0][1]);
                    shape.points.forEach(point => ctx.lineTo(point[0], point[1]));
                    ctx.stroke();
                    break;
                case 'rectangle':
                    ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
                    break;
                case 'circle':
                    ctx.beginPath();
                    ctx.ellipse(
                        shape.x + shape.width / 2,
                        shape.y + shape.height / 2,
                        Math.abs(shape.width / 2),
                        Math.abs(shape.height / 2),
                        0, 0, 2 * Math.PI
                    );
                    ctx.stroke();
                    break;
                case 'text':
                    ctx.font = `${shape.fontSize}px Arial`;
                    ctx.fillText(shape.text, shape.x, shape.y + shape.height);
                    break;
                case 'image':
                    ctx.drawImage(shape.image, shape.x, shape.y, shape.width, shape.height);
                    break;
            }
        }

        function drawBoundingBox(shape) {
            ctx.strokeStyle = 'blue';
            ctx.lineWidth = 2;
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);

            // Draw larger resize handle
            const handleSize = 10;
            ctx.fillStyle = 'blue';
            ctx.fillRect(shape.x + shape.width - handleSize, shape.y + shape.height - handleSize, handleSize, handleSize);
        }

        function saveAnnotation() {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(canvas, 0, 0);

            const annotation = {
                imageBase64: tempCanvas.toDataURL(),
                startTime: video.currentTime,
                endTime: video.currentTime + 3,
                shapes: shapes
            };
            annotations.push(annotation);
            updateAnnotationList();
        }

        function closeDrawingMode() {
            existingControls.style.display = "block"

            document.body.removeChild(canvas);
            document.body.removeChild(drawingControls);
            document.body.removeChild(overlay);
            video.play();
        }
        // Initialize the active tool indicator
        updateActiveToolIndicator();
    }

    function updateAnnotationList(importedAnnotations = null) {
        if (importedAnnotations) {
            annotations = importedAnnotations
        }
        annotationList.innerHTML = '';
        annotations.sort((a, b) => a.startTime - b.startTime);
        annotations.forEach((annotation, index) => {
            const item = document.createElement('div');
            item.className = `annotation-list-${index}`;
            item.style.fontSize = '16px';
            item.style.marginBottom = '10px';

            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.style.fontSize = '20px';
            nameInput.style.fontWeight = 'bold';
            nameInput.style.padding = '5px';
            nameInput.style.marginRight = '10px';
            nameInput.value = annotation.name || `Annotation ${index + 1}`;
            nameInput.addEventListener('change', (e) => {
                annotation.name = e.target.value;
            });
            item.appendChild(nameInput);

            const startTimeInput = document.createElement('input');
            startTimeInput.type = 'text';
            startTimeInput.style.fontSize = '16px';
            startTimeInput.style.padding = '5px';
            startTimeInput.style.marginRight = '10px';
            startTimeInput.value = formatTime(annotation.startTime);
            startTimeInput.addEventListener('change', (e) => {
                annotation.startTime = parseTime(e.target.value);
            });
            item.appendChild(startTimeInput);

            const endTimeInput = document.createElement('input');
            endTimeInput.type = 'text';
            endTimeInput.style.fontSize = '16px';
            endTimeInput.style.padding = '5px';
            endTimeInput.value = formatTime(annotation.endTime);
            endTimeInput.addEventListener('change', (e) => {
                annotation.endTime = parseTime(e.target.value);
            });
            item.appendChild(endTimeInput);

            const goToButton = createButton('Go to Time', () => {
                video.currentTime = annotation.startTime;
            });
            item.appendChild(goToButton);

            const deleteButton = createButton('Delete', () => {
                annotations.splice(index, 1);
                updateAnnotationList();
            });
            deleteButton.style.backgroundColor = 'red';
            item.appendChild(deleteButton);

            // Add the image base64 as a data attribute
            item.dataset.imageBase64 = annotation.imageBase64;

            annotationList.appendChild(item);
        });
    }



    let currentlyDisplayedAnnotation = null;

    function showAnnotations() {
        const currentTime = video.currentTime;
        const ctx = persistentCanvas.getContext('2d');

        let annotationToShow = null;
        for (let i = annotations.length - 1; i >= 0; i--) {
            if (currentTime >= annotations[i].startTime && currentTime <= annotations[i].endTime) {
                annotationToShow = annotations[i];
                break;
            }
        }

        if (annotationToShow !== currentlyDisplayedAnnotation) {
            ctx.clearRect(0, 0, persistentCanvas.width, persistentCanvas.height);
            if (annotationToShow) {
                const img = new Image();
                img.onload = () => {
                    ctx.drawImage(img, 0, 0, persistentCanvas.width, persistentCanvas.height);
                };
                img.src = annotationToShow.imageBase64;
            }
            currentlyDisplayedAnnotation = annotationToShow;
        }
    }

    toggleSwitch.addEventListener('change', (e) => {
        if (e.target.checked) {
            persistentCanvas.style.display = 'block';
            video.addEventListener('timeupdate', showAnnotations);
        } else {
            persistentCanvas.style.display = 'none';
            video.removeEventListener('timeupdate', showAnnotations);
            const ctx = persistentCanvas.getContext('2d');
            ctx.clearRect(0, 0, persistentCanvas.width, persistentCanvas.height);
        }
    });

    return annotationSection;
}

// TIMESTAMP SECTION OF COMPONENTS

function formatTime(seconds) {
    const date = new Date(null);
    date.setSeconds(seconds);
    return date.toISOString().substr(11, 8);
}


function convertToSeconds(timestamp) {
    const parts = timestamp.split(':').map(Number);
    if (parts.length === 3) {
        // HH:MM:SS format
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
        // MM:SS format
        return parts[0] * 60 + parts[1];
    } else {
        console.error('Invalid timestamp format');
        return 0;
    }
}


function getTimestamps(index) {
    const timestampSection = document.querySelector(`.timestamp-section-${index}`);
    if (!timestampSection) return [];

    const timestampRows = timestampSection.querySelectorAll('div[style*="display: flex"]');
    const timestamps = [];

    timestampRows.forEach(row => {
        const titleElement = row.querySelector('div[style*="font-weight: bold"]');
        const descriptionElement = row.querySelector('div[style*="text-overflow: ellipsis"]');

        if (titleElement && descriptionElement) {
            const titleParts = titleElement.textContent.split('|');
            if (titleParts.length === 2) {
                const title = titleParts[0].trim();
                const timestamp = titleParts[1].trim();
                const description = descriptionElement.textContent.trim();

                timestamps.push({
                    title: title,
                    timestamp: timestamp,
                    description: description
                });
            }
        }
    });

    return timestamps;
}


function openAddTimestampPopup(video, timestamps, timestampSection) {
    video.pause();

    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    popup.style.padding = '20px';
    popup.style.borderRadius = '10px';
    popup.style.zIndex = '1000';

    const title = document.createElement('input');
    title.placeholder = 'Title';
    title.style.width = '100%';
    title.style.marginBottom = '10px';
    title.style.padding = '5px';

    const description = document.createElement('textarea');
    description.placeholder = 'Description';
    description.style.width = '100%';
    description.style.marginBottom = '10px';
    description.style.padding = '5px';

    const addButton = createButton('Add');
    addButton.addEventListener('click', () => {
        const currentTime = formatTime(video.currentTime);
        timestamps.push({
            timestamp: currentTime,
            title: title.value,
            description: description.value
        });
        document.body.removeChild(popup);
        updateTimestampSection(video, timestamps, timestampSection);
        video.play();

    });

    const cancelButton = createButton('Cancel');
    cancelButton.addEventListener('click', () => {
        document.body.removeChild(popup);
        video.play();
    });

    popup.appendChild(title);
    popup.appendChild(description);
    popup.appendChild(addButton);
    popup.appendChild(cancelButton);

    document.body.appendChild(popup);
}


function updateTimestampSection(video, timestamps, timestampSection) {
    // Clear existing timestamps
    while (timestampSection.firstChild) {
        timestampSection.removeChild(timestampSection.firstChild);
    }


    const importButton = createButton('Import Timestamps');
    importButton.addEventListener('click', () => importTimestamps(video, timestampSection));
    timestampSection.appendChild(importButton);

    // Re-add the "Add timestamp" button
    const addButton = createButton('Add timestamp on current time');
    addButton.style.marginBottom = '30px';
    addButton.style.width = '50%';
    addButton.addEventListener('click', () => {
        openAddTimestampPopup(video, timestamps, timestampSection);
    });
    timestampSection.appendChild(addButton);

    // Sort timestamps
    timestamps.sort((a, b) => {
        return convertToSeconds(a.timestamp) - convertToSeconds(b.timestamp);
    });

    // Add timestamp rows
    timestamps.forEach(stamp => {
        const row = createTimestampRow(video, stamp, timestamps, timestampSection);
        timestampSection.appendChild(row);
    });
}

function createTimestampRow(video, stamp, timestamps, timestampSection) {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.marginBottom = '15px';
    row.style.padding = '10px';
    row.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    row.style.borderRadius = '5px';
    row.style.width = '95%';

    const info = document.createElement('div');
    info.style.marginRight = '10px';
    info.style.overflow = 'hidden';
    info.style.width = '70%';

    const title = document.createElement('div');
    title.textContent = stamp.title + " | " + stamp.timestamp;
    title.style.fontWeight = 'bold';
    title.style.fontSize = '16px';
    title.style.marginBottom = '5px';
    title.style.color = '#ffffff';

    const description = document.createElement('div');
    description.textContent = stamp.description;
    description.style.fontSize = '14px';
    description.style.color = 'white';
    description.style.whiteSpace = 'nowrap';
    description.style.overflow = 'hidden';
    description.style.textOverflow = 'ellipsis';
    description.style.fontWeight = 'bold';

    info.appendChild(title);
    info.appendChild(description);

    const jumpButton = createButton('Go to time');
    jumpButton.style.fontWeight = 'bold';
    jumpButton.style.width = '15%';
    jumpButton.style.padding = '8px';
    jumpButton.style.fontSize = '14px';
    jumpButton.style.backgroundColor = '#4CAF50';
    jumpButton.style.color = 'white';
    jumpButton.style.border = 'none';
    jumpButton.style.borderRadius = '4px';
    jumpButton.style.cursor = 'pointer';
    jumpButton.addEventListener('click', () => {
        video.currentTime = convertToSeconds(stamp.timestamp);
    });

    const deleteButton = createButton('Delete');
    deleteButton.style.fontWeight = 'bold';
    deleteButton.style.width = '15%';
    deleteButton.style.padding = '8px';
    deleteButton.style.fontSize = '14px';
    deleteButton.style.backgroundColor = '#f44336';
    deleteButton.style.color = 'white';
    deleteButton.style.border = 'none';
    deleteButton.style.borderRadius = '4px';
    deleteButton.style.cursor = 'pointer';
    deleteButton.style.marginLeft = '5px';
    deleteButton.addEventListener('click', () => {
        deleteTimestamp(video, stamp, timestamps, timestampSection);
    });

    row.appendChild(info);
    row.appendChild(jumpButton);
    row.appendChild(deleteButton);

    return row;
}


function createTimestampSection(video, timestamps, index) {
    const timestampSection = document.createElement('div');
    timestampSection.className = `timestamp-section-${index}`;

    timestampSection.style.maxHeight = '20vh';
    timestampSection.style.overflowY = 'auto';
    timestampSection.style.padding = '10px';
    timestampSection.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    timestampSection.style.borderRadius = '5px';


    updateTimestampSection(video, timestamps, timestampSection);

    return timestampSection;
}

function importTimestamps(video, timestampSection) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none';

    input.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const config = JSON.parse(e.target.result);
                    updateTimestampSection(video, config.timestamps, timestampSection);
                    alert('Timestamps imported successfully!');
                } catch (error) {
                    console.error('Error importing timestamps:', error);
                    alert('Error importing timestamps. Please check the file format.');
                }
            };
            reader.readAsText(file);
        }
    });

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
}

function deleteTimestamp(video, stamp, timestamps, timestampSection) {
    const index = timestamps.indexOf(stamp);
    if (index > -1) {
        timestamps.splice(index, 1);
        updateTimestampSection(video, timestamps, timestampSection);
    }
}

// VIDEO SECTION
function getVideoSettings(index) {
    return {
        isVideoProcessingEnabled: document.getElementById(`video-processing-toggle-${index}`).checked,
        brightness: parseInt(document.getElementById(`brightness-slider-${index}`).value) / 100,
        contrast: parseInt(document.getElementById(`contrast-slider-${index}`).value) / 100,
        saturation: parseInt(document.getElementById(`saturation-slider-${index}`).value) / 100,
        exposure: parseInt(document.getElementById(`exposure-slider-${index}`).value) / 100,
        hue: parseInt(document.getElementById(`hue-slider-${index}`).value),
        sharpness: parseInt(document.getElementById(`sharpness-slider-${index}`).value) / 100,
        grayscale: document.getElementById(`grayscale-toggle-${index}`).checked ? 1 : 0,
        invert: document.getElementById(`invert-toggle-${index}`).checked ? 1 : 0
    };
}

function updateVideoSection(videoSettings, index) {
    document.getElementById(`video-processing-toggle-${index}`).checked = videoSettings.isVideoProcessingEnabled;
    document.getElementById(`brightness-slider-${index}`).value = videoSettings.brightness * 100;
    document.getElementById(`contrast-slider-${index}`).value = videoSettings.contrast * 100;
    document.getElementById(`saturation-slider-${index}`).value = videoSettings.saturation * 100;
    document.getElementById(`exposure-slider-${index}`).value = videoSettings.exposure * 100;
    document.getElementById(`hue-slider-${index}`).value = videoSettings.hue;
    document.getElementById(`sharpness-slider-${index}`).value = videoSettings.sharpness * 100;
    document.getElementById(`grayscale-toggle-${index}`).checked = videoSettings.grayscale === 1;
    document.getElementById(`invert-toggle-${index}`).checked = videoSettings.invert === 1;

    // Apply the updated settings
    applyVideoEffects(document.querySelectorAll('video')[index], videoSettings);
}

function createVideoSection(video, index) {
    let isVideoProcessingEnabled = false;
    const videoSection = document.createElement('div');
    videoSection.className = `video-section-${index}`;
    videoSection.style.pointerEvents = 'auto';

    const toggleContainer = createControlContainer('Video Processing:');
    const toggleSwitch = createToggleSwitch(isVideoProcessingEnabled);
    toggleSwitch.id = `video-processing-toggle-${index}`;
    toggleContainer.appendChild(toggleSwitch);
    videoSection.appendChild(toggleContainer);

    const brightnessSlider = createSlider('Brightness:', 0, 200, 100);
    brightnessSlider.querySelector('input').id = `brightness-slider-${index}`;
    videoSection.appendChild(brightnessSlider);

    const contrastSlider = createSlider('Contrast:', 0, 200, 100);
    contrastSlider.querySelector('input').id = `contrast-slider-${index}`;
    videoSection.appendChild(contrastSlider);

    const saturationSlider = createSlider('Saturation:', 0, 200, 100);
    saturationSlider.querySelector('input').id = `saturation-slider-${index}`;
    videoSection.appendChild(saturationSlider);

    const exposureSlider = createSlider('Exposure:', 0, 200, 100);
    exposureSlider.querySelector('input').id = `exposure-slider-${index}`;
    videoSection.appendChild(exposureSlider);

    const hueSlider = createSlider('Hue:', 0, 360, 0);
    hueSlider.querySelector('input').id = `hue-slider-${index}`;
    videoSection.appendChild(hueSlider);

    const sharpnessSlider = createSlider('Sharpness:', 0, 200, 100);
    sharpnessSlider.querySelector('input').id = `sharpness-slider-${index}`;
    videoSection.appendChild(sharpnessSlider);

    const grayscaleToggleContainer = createControlContainer('Grayscale:');
    const grayscaleToggle = createToggleSwitch(false);
    grayscaleToggle.id = `grayscale-toggle-${index}`;
    grayscaleToggleContainer.appendChild(grayscaleToggle);
    videoSection.appendChild(grayscaleToggleContainer);

    const invertToggleContainer = createControlContainer('Invert Colors:');
    const invertToggle = createToggleSwitch(false);
    invertToggle.id = `invert-toggle-${index}`;
    invertToggleContainer.appendChild(invertToggle);
    videoSection.appendChild(invertToggleContainer);

    function toggleVideoProcessing(event) {
        isVideoProcessingEnabled = event.target.checked;
        if (isVideoProcessingEnabled) {
            applyVideoEffects(video, getVideoSettings(index));
        } else {
            removeVideoEffects(video);
        }
    }



    function updateVideoEffects() {
        if (isVideoProcessingEnabled) {
            applyVideoEffects(video, getVideoSettings(index));
        }
    }

    function applyVideoEffects(video, settings) {
        video.style.filter = `brightness(${settings.brightness}) contrast(${settings.contrast}) saturate(${settings.saturation}) 
                              brightness(${settings.exposure}) hue-rotate(${settings.hue}deg) blur(${2 - settings.sharpness}px)
                              grayscale(${settings.grayscale}) invert(${settings.invert})`;
    }

    function removeVideoEffects(video) {
        video.style.filter = 'none';
    }

    // Add event listeners
    toggleSwitch.addEventListener('change', toggleVideoProcessing);
    brightnessSlider.querySelector('input').addEventListener('input', updateVideoEffects);
    contrastSlider.querySelector('input').addEventListener('input', updateVideoEffects);
    saturationSlider.querySelector('input').addEventListener('input', updateVideoEffects);
    exposureSlider.querySelector('input').addEventListener('input', updateVideoEffects);
    hueSlider.querySelector('input').addEventListener('input', updateVideoEffects);
    sharpnessSlider.querySelector('input').addEventListener('input', updateVideoEffects);
    grayscaleToggle.addEventListener('change', updateVideoEffects);
    invertToggle.addEventListener('change', updateVideoEffects);

    return videoSection;
}

//AUDIO SECTION OF COMPONENTS
function updateAudioSection(audioSettings, index) {
    document.getElementById(`audio-processing-toggle-${index}`).checked = audioSettings.isAudioProcessingEnabled;
    document.getElementById(`volume-slider-${index}`).value = audioSettings.volume * 100;
    document.getElementById(`filter-intensity-slider-${index}`).value = audioSettings.filterIntensity;
    document.getElementById(`voice-boost-slider-${index}`).value = audioSettings.voiceBoost;
    document.getElementById(`clarity-slider-${index}`).value = audioSettings.clarity;

    // Apply the updated settings
    applyAudioEffects(document.querySelectorAll('video')[index], audioSettings);
}


function getAudioSettings(index) {
    return {
        isAudioProcessingEnabled: document.getElementById(`audio-processing-toggle-${index}`).checked,
        volume: parseInt(document.getElementById(`volume-slider-${index}`).value) / 100,
        filterIntensity: parseInt(document.getElementById(`filter-intensity-slider-${index}`).value),
        voiceBoost: parseInt(document.getElementById(`voice-boost-slider-${index}`).value),
        clarity: parseInt(document.getElementById(`clarity-slider-${index}`).value)
    };
}


function createAudioSection(video, index) {
    let isAudioProcessingEnabled = false;
    let filterIntensity = 50; // Default value
    const audioSection = document.createElement('div');
    audioSection.className = `audio-section-${index}`;

    audioSection.style.pointerEvents = 'auto';

    const toggleContainer = createControlContainer('Audio Processing:');
    const toggleSwitch = createToggleSwitch(isAudioProcessingEnabled);
    toggleSwitch.id = `audio-processing-toggle-${index}`;

    toggleContainer.appendChild(toggleSwitch);
    audioSection.appendChild(toggleContainer);

    const volumeSlider = createSlider('Volume:', 0, 100, 100);
    volumeSlider.querySelector('input').id = `volume-slider-${index}`;
    audioSection.appendChild(volumeSlider);

    const intensitySlider = createSlider('Noise Filter:', 0, 100, filterIntensity);
    intensitySlider.querySelector('input').id = `filter-intensity-slider-${index}`;
    audioSection.appendChild(intensitySlider);

    const voiceBoostSlider = createSlider('Voice Boost:', 0, 100, 50);
    voiceBoostSlider.querySelector('input').id = `voice-boost-slider-${index}`;
    audioSection.appendChild(voiceBoostSlider);

    const claritySlider = createSlider('Clarity:', 0, 100, 50);
    claritySlider.querySelector('input').id = `clarity-slider-${index}`;
    audioSection.appendChild(claritySlider);


    function toggleAudioProcessing(event) {
        isAudioProcessingEnabled = event.target.checked;
        if (isAudioProcessingEnabled) {
            applyAudioEffects(video, getAudioSettings(index));
        } else {
            removeAudioEffects(video);
        }
    }

    function updateVolume(event) {
        const volume = event.target.value / 100;
        video.volume = volume;
    }



    function updateAudioEffects() {
        if (isAudioProcessingEnabled) {
            applyAudioEffects(video, getAudioSettings(index));
        }
    }

    function applyAudioEffects(video, settings) {
        if (!video.audioContext) {
            video.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            video.source = video.audioContext.createMediaElementSource(video);
        }

        if (!video.filter) {
            video.filter = video.audioContext.createBiquadFilter();
            video.filter.type = "highpass";
        }

        if (!video.voiceBoost) {
            video.voiceBoost = video.audioContext.createBiquadFilter();
            video.voiceBoost.type = "peaking";
        }

        if (!video.clarity) {
            video.clarity = video.audioContext.createBiquadFilter();
            video.clarity.type = "highshelf";
        }

        // Update filter settings
        const frequency = 20 + (settings.filterIntensity / 100) * 1980;
        video.filter.frequency.setValueAtTime(frequency, video.audioContext.currentTime);
        video.volume = settings.volume;

        // Update voice boost
        video.voiceBoost.frequency.setValueAtTime(1000, video.audioContext.currentTime);
        video.voiceBoost.Q.setValueAtTime(1, video.audioContext.currentTime);
        video.voiceBoost.gain.setValueAtTime(settings.voiceBoost / 2, video.audioContext.currentTime);

        // Update clarity
        video.clarity.frequency.setValueAtTime(3000, video.audioContext.currentTime);
        video.clarity.gain.setValueAtTime(settings.clarity / 4, video.audioContext.currentTime);

        // Connect nodes
        video.source.disconnect();
        video.source.connect(video.filter);
        video.filter.connect(video.voiceBoost);
        video.voiceBoost.connect(video.clarity);
        video.clarity.connect(video.audioContext.destination);
    }

    function removeAudioEffects(video) {
        if (video.audioContext) {
            video.source.disconnect();
            video.source.connect(video.audioContext.destination);
        }
    }


    // Add event listeners
    toggleSwitch.addEventListener('change', toggleAudioProcessing);
    volumeSlider.querySelector('input').addEventListener('input', updateVolume);
    intensitySlider.querySelector('input').addEventListener('input', updateAudioEffects);
    voiceBoostSlider.querySelector('input').addEventListener('input', updateAudioEffects);
    claritySlider.querySelector('input').addEventListener('input', updateAudioEffects);

    return audioSection;
}


// ==================
// DESCRIBE SECTION
function createDescribeSection(video, index) {
    video.pause()
    const describeSection = document.createElement('div');
    describeSection.style.pointerEvents = 'auto';

    const currentFrame = document.createElement('img');
    currentFrame.style.width = '40%';
    currentFrame.style.marginBottom = '10px';
    describeSection.appendChild(currentFrame);

    const promptInput = document.createElement('input');
    promptInput.type = 'text';
    promptInput.placeholder = 'Enter a description prompt';
    promptInput.style.width = '100%';
    promptInput.style.height = '40px';
    promptInput.style.marginBottom = '10px';
    describeSection.appendChild(promptInput);

    const submitButton = createButton('Submit', () => {
        const prompt = promptInput.value;
        if (prompt) {
            const currentTime = video.currentTime;
            video.pause();

            // Capture the current frame as an image
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageDataURL = canvas.toDataURL('image/jpeg');

            // Make the API call to FAL
            const apiKey = '<FAL_API_KEY';
            const apiUrl = 'https://fal.run/fal-ai/moondream/batched';

            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Key ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                    {
                        "model_id": "vikhyatk/moondream2",
                        "inputs": [
                            {
                                "prompt": prompt,
                                "image_url": imageDataURL
                            }
                        ],
                        "max_tokens": 200,
                        "temperature": 0.2,
                        "top_p": 1,
                        "repetition_penalty": 1
                    }
                )
            })
                .then(response => response.json())
                .then(data => {
                    // Play back the audio from FAL using the device API
                    const text = data.outputs[0]
                    // Create a new SpeechSynthesisUtterance instance
                    const utterance = new SpeechSynthesisUtterance(text);

                    // Set the voice and other properties (optional)
                    const voices = window.speechSynthesis.getVoices();
                    utterance.voice = voices[0]; // Choose the first available voice
                    utterance.rate = 1; // Set the speech rate (optional)
                    utterance.pitch = 1; // Set the speech pitch (optional)

                    // Play the speech
                    window.speechSynthesis.speak(utterance);

                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
    });
    describeSection.appendChild(submitButton);

    video.addEventListener('timeupdate', () => {
        // Update the current frame image
        currentFrame.src = captureCurrentFrame(video);
    });

    return describeSection;
}

function captureCurrentFrame(video) {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg');
}

// ====

const addVideoControls = () => {
    const videos = document.querySelectorAll('video');
    videos.forEach((video, index) => {

        const sectionIds = {
            Timestamps: `timestamps-section-${index}`,
            Audio: `audio-section-${index}`,
            Video: `video-section-${index}`,
            Settings: `settings-section-${index}`
        };

        const timestamps = [
            { "title": "Introduction", "description": "Start of the video", "timestamp": "00:00" },
            { "title": "Main Topic", "description": "Discussion of key points", "timestamp": "01:30" },
            { "title": "Conclusion", "description": "Summary and closing remarks", "timestamp": "2:45" }
        ];


        // Check if controls already exist
        const existingControls = document.querySelector(`.video-controls-wrapper-${index}`);
        if (existingControls) {
            // Toggle visibility if controls already exist
            existingControls.style.display = existingControls.style.display === 'none' ? 'block' : 'none';
            return;
        }

        const controlWrapper = document.createElement('div');
        controlWrapper.className = `video-controls-wrapper-${index}`;
        controlWrapper.style.position = 'absolute';
        controlWrapper.style.zIndex = '1000';
        controlWrapper.style.width = "100%"
        // Get video position and dimensions
        const videoRect = video.getBoundingClientRect();



        // Create draggable container for button row and content section
        const draggableContainer = document.createElement('div');
        draggableContainer.style.position = 'absolute';
        draggableContainer.style.left = `${videoRect.left}px`;
        draggableContainer.style.top = `${videoRect.bottom + 10}px`; // 10px gap below video
        draggableContainer.style.cursor = 'move'; // Indicate draggable

        // Create button row
        const buttonRow = document.createElement('div');
        buttonRow.style.display = 'flex';
        buttonRow.style.justifyContent = 'space-around';
        buttonRow.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        buttonRow.style.padding = '10px';
        buttonRow.style.borderRadius = '5px 5px 0 0';
        buttonRow.style.width = `${videoRect.width}px`;

        // Create content section
        const contentSection = document.createElement('div');
        contentSection.style.backgroundColor = 'rgba(0, 0, 0, 1)';
        contentSection.style.padding = '10px';
        contentSection.style.borderRadius = '0 0 5px 5px';
        contentSection.style.color = 'white';
        contentSection.style.display = 'none';
        contentSection.style.width = `${videoRect.width}px`;



        const buttons = ['Timestamps', 'Describe', 'Annotation', 'Audio', 'Video', "Focus", 'Settings'];
        const buttonElements = {};
        const sectionContents = {};

        buttons.forEach(buttonText => {
            const button = createButton(buttonText);
            buttonRow.appendChild(button);
            buttonElements[buttonText] = button;

            button.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent drag when clicking button

                // Hide all sections
                Object.values(sectionContents).forEach(section => {
                    section.style.display = 'none';
                });

                // Show the clicked section
                if (!sectionContents[buttonText]) {
                    if (buttonText === 'Audio') {
                        sectionContents[buttonText] = createAudioSection(video, index);
                    } else if (buttonText === 'Timestamps') {
                        sectionContents[buttonText] = createTimestampSection(video, timestamps, index);
                    } else if (buttonText === 'Video') {
                        sectionContents[buttonText] = createVideoSection(video, index);
                    } else if (buttonText === 'Settings') {
                        sectionContents[buttonText] = createSettingsSection(video, index, sectionIds);
                    } else if (buttonText === 'Annotation') {
                        sectionContents[buttonText] = createAnnotationSection(video, index);
                    } else if (buttonText === 'Focus') {
                        sectionContents[buttonText] = createFocusSection(video, index);
                    } else if (buttonText === 'Describe') {
                        sectionContents[buttonText] = createDescribeSection(video, index);
                    }


                    if (sectionContents[buttonText]) {
                        sectionContents[buttonText].id = sectionIds[buttonText];
                        contentSection.appendChild(sectionContents[buttonText]);
                    }
                }

                if (sectionContents[buttonText]) {
                    sectionContents[buttonText].style.display = 'block';
                }

                contentSection.style.display = 'block';

                // Highlight active button
                Object.values(buttonElements).forEach(btn => {
                    btn.style.backgroundColor = '#4CAF50';
                });
                button.style.backgroundColor = '#45a049';
            });
        });

        draggableContainer.appendChild(buttonRow);
        draggableContainer.appendChild(contentSection);

        controlWrapper.appendChild(draggableContainer);

        // Append the control wrapper to the body
        document.body.appendChild(controlWrapper);



        // Make draggable container draggable
        makeDraggable(draggableContainer)
    });
};



chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'addVideoControls') {
        addVideoControls();
        sendResponse({ status: 'Controls added or toggled' });
    }
});