// script.js
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let textData = [];
let undoStack = [];
let redoStack = [];
let currentText = null;

canvas.addEventListener('mousedown', startMoveText);
canvas.addEventListener('mousemove', moveText);
canvas.addEventListener('mouseup', stopMoveText);

document.getElementById('add-text').addEventListener('click', addText);
document.getElementById('delete-text').addEventListener('click', deleteText); // Delete text button
document.getElementById('bold').addEventListener('click', toggleBold);
document.getElementById('italic').addEventListener('click', toggleItalic);
document.getElementById('underline').addEventListener('click', toggleUnderline);
document.getElementById('font-select').addEventListener('change', changeFont);
document.getElementById('font-size').addEventListener('input', changeFontSize);
document.getElementById('undo').addEventListener('click', undoAction);
document.getElementById('redo').addEventListener('click', redoAction);
document.getElementById('align-left').addEventListener('click', () => alignText('left'));
document.getElementById('align-center').addEventListener('click', () => alignText('center'));
document.getElementById('align-right').addEventListener('click', () => alignText('right'));

function addText() {
    const text = prompt('Enter the text:');
    if (text) {
        const font = document.getElementById('font-select').value;
        const fontSize = parseInt(document.getElementById('font-size').value);
        const x = 100;
        const y = 100;
        const textObject = { text, font, fontSize, x, y, isBold: false, isItalic: false, isUnderline: false, alignment: 'left' };

        textData.push(textObject);
        currentText = textObject;

        undoStack.push({ action: 'add', text: { ...textObject } }); // Add undo action
        redoStack = [];

        renderCanvas();
    }
}

function renderCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    textData.forEach(textObj => {
        ctx.font = `${textObj.isBold ? 'bold' : ''} ${textObj.isItalic ? 'italic' : ''} ${textObj.fontSize}px ${textObj.font}`;
        ctx.textDecoration = textObj.isUnderline ? 'underline' : 'none';
        const textWidth = ctx.measureText(textObj.text).width;

        // Align text
        let xPos = textObj.x;
        if (textObj.alignment === 'center') {
            xPos = (canvas.width - textWidth) / 2;
        } else if (textObj.alignment === 'right') {
            xPos = canvas.width - textWidth - 20;
        }

        ctx.fillText(textObj.text, xPos, textObj.y);
    });
}

function startMoveText(event) {
    if (currentText) {
        currentText.offsetX = event.offsetX - currentText.x;
        currentText.offsetY = event.offsetY - currentText.y;
    }
}

function moveText(event) {
    if (currentText && event.buttons === 1) {
        currentText.x = event.offsetX - currentText.offsetX;
        currentText.y = event.offsetY - currentText.offsetY;
        renderCanvas();
    }
}

function stopMoveText() {
    if (currentText) {
        undoStack.push({ action: 'move', text: { ...currentText } });
        redoStack = [];
    }
}

function toggleBold() {
    if (currentText) {
        currentText.isBold = !currentText.isBold;
        renderCanvas();
    }
}

function toggleItalic() {
    if (currentText) {
        currentText.isItalic = !currentText.isItalic;
        renderCanvas();
    }
}

function toggleUnderline() {
    if (currentText) {
        currentText.isUnderline = !currentText.isUnderline;
        renderCanvas();
    }
}

function changeFont() {
    if (currentText) {
        currentText.font = document.getElementById('font-select').value;
        renderCanvas();
    }
}

function changeFontSize() {
    if (currentText) {
        currentText.fontSize = parseInt(document.getElementById('font-size').value);
        renderCanvas();
    }
}

function alignText(alignment) {
    if (currentText) {
        currentText.alignment = alignment;
        renderCanvas();
    }
}

function undoAction() {
    if (undoStack.length > 0) {
        const lastAction = undoStack.pop();
        redoStack.push(lastAction);

        if (lastAction.action === 'move') {
            currentText.x = lastAction.text.x;
            currentText.y = lastAction.text.y;
        }         else if (lastAction.action === 'modify') {
            currentText = lastAction.text;
        } else if (lastAction.action === 'add') {
            textData = textData.filter(text => text !== lastAction.text);
        }
        renderCanvas();
    }
}

function redoAction() {
    if (redoStack.length > 0) {
        const lastRedoAction = redoStack.pop();
        undoStack.push(lastRedoAction);

        if (lastRedoAction.action === 'move') {
            currentText.x = lastRedoAction.text.x;
            currentText.y = lastRedoAction.text.y;
        } else if (lastRedoAction.action === 'modify') {
            currentText = lastRedoAction.text;
        } else if (lastRedoAction.action === 'add') {
            textData.push(lastRedoAction.text);
        }
        renderCanvas();
    }
}

function deleteText() {
    if (currentText) {
        const deletedText = { ...currentText }; // Make a copy of the text object before deletion
        textData = textData.filter(text => text !== currentText);
        undoStack.push({ action: 'delete', text: deletedText });
        redoStack = [];

        currentText = null; // Deselect text after deleting
        renderCanvas();
    }
}

