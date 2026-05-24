# Changelog

All notable changes to this project will be documented in this file.

## [v2.0.0] - 2026-05-24

### Security
- Reviewed repository for obvious backdoors and risky patterns.
- Removed legacy Python dependency `keyboard` from runtime stack.
- Added postal-code input validation (`^\\d{5}$`) before scraping.
- Added CSV formula-injection mitigation when exporting product fields.
- Switched to pinned npm dependency versions for reproducibility.

### Changed
- Full migration from Python implementation to TypeScript.
- Replaced SeleniumBase flow with Playwright-based browser automation.
- Refactored scraper into `src/scraper.ts` and `src/helpers.ts`.
- Added Node/TypeScript project scaffolding (`package.json`, `tsconfig.json`).
- Added npm scripts for check/build/start and release workflow.

### Removed
- `scraper.py`
- `funcionesAux.py`
- `requirements.txt`

## [2024.11] - 2024-11-07

### 🎉 Major Updates by @[tu-usuario]

This version represents a significant improvement to the scraper with enhanced stability, better documentation, and improved maintainability.

### ✨ Added
- **Enhanced Documentation**: Complete README rewrite with detailed installation and usage instructions
- **Comprehensive Error Handling**: Added try-catch blocks for better resilience
- **Anti-Detection Improvements**: Enhanced undetectable browsing capabilities
- **Modular Code Structure**: Better separation of concerns with auxiliary functions
- **User Experience**: Interactive postal code input with clear prompts
- **Smart Waiting**: Intelligent element waiting with configurable timeouts
- **CSV Output**: Timestamped output files for better organization
