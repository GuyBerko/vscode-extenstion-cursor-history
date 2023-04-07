# CursorHistory 

[![GitHub](https://img.shields.io/github/license/GuyBerko/vscode-extenstion-cursor-history?style=flat)](https://github.com/GuyBerko/vscode-extenstion-cursor-history/blob/main/LICENSE) 
[![Known Vulnerabilities](https://snyk.io/test/github/GuyBerko/vscode-extenstion-cursor-history/badge.svg)](https://snyk.io/test/github/GuyBerko/vscode-extenstion-cursor-history)
[![Percentage of issues still open](https://isitmaintained.com/badge/open/GuyBerko/vscode-extenstion-cursor-history.svg)](http://isitmaintained.com/project/GuyBerko/vscode-extenstion-cursor-history') 
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)](http://makeapullrequest.com)

This is an extension for going forward and backwards in the cursor placement history

![Example](https://github.com/GuyBerko/vscode-extenstion-cursor-history/blob/main/images/cursor-history-example.gif)

## How to use

### Keyboard:
* Press `ctrl+cmd+right` (macOS) or `ctrl+alt+right` (Windows) to go forward in the cursor history.
* Press `ctrl+cmd+left` (macOS) or `ctrl+alt+left` (Windows) to go backwards in the cursor history.

### Action Buttons:
* Click `»` button in the bottom left tool bar to go forward in the cursor history.
* Click `«` button in the bottom left tool bar to go backwards in the cursor history.

When you will reach the start or end of history a notification message will popup to inform you.


## Known issues:
- On mac when using the default key binding there could be a sound from the computer this is a known issue in vscode 
(as reported here: https://github.com/microsoft/vscode/issues/46149 and here https://github.com/microsoft/vscode/issues/153061) and probably will not be resolved. 
our suggestion is to change the default key binding to some thing else like `cmd+right` and `cmd+left`.

## Release Notes


### 1.0.0 - 1.0.4

Initial release of Cursor History

### 1.0.5

Add know issue on mac with sound playing when pressing the default keyboard shortcut

### 1.1.0

Add more error handlers and comments

### 1.1.1

Remove redundant .md file

### 1.1.2 - 1.1.3

Add example gif to readme

### 1.1.4

Fix issue when selection cause duplicate history



**Enjoy!**
