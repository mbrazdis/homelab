# Contributing to HomeLab

Thank you for your interest in contributing to HomeLab! This document provides guidelines and instructions for contributing.

## 🌟 Ways to Contribute

- **Add Device Integrations** - Support for new smart home devices
- **Improve UI/UX** - Design enhancements and user experience improvements
- **Write Tests** - Unit tests, integration tests, and end-to-end tests
- **Fix Bugs** - Check the issues page for known bugs
- **Documentation** - Improve README, add tutorials, or write code comments
- **Feature Requests** - Suggest new features or enhancements

## 🚀 Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/homelab.git
   cd homelab
   ```
3. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📋 Development Setup

Follow the installation instructions in the [README.md](README.md#getting-started).

## 🔧 Development Guidelines

### Code Style

- **Python**: Follow PEP 8 guidelines
- **TypeScript/React**: Use ESLint configuration provided
- **Swift**: Follow Swift style guidelines

### Adding New Device Integrations

1. Create a new directory in `core/integration/{manufacturer}/{model}/`
2. Implement the `BaseDevice` abstract class
3. Add control functions for device operations
4. Update `DeviceStateMachine.handle_message()` for device-specific MQTT topics
5. Add WebSocket command handlers in `websocket_service.py`
6. Create frontend components in `frontend/src/components/customComponents/`
7. Test thoroughly with actual hardware

Example structure:
```
core/integration/
└── philips_hue/
    └── color_bulb/
        ├── __init__.py
        ├── control.py
        └── schemas.py
```

### Database Changes

1. Modify `core/prisma/schema.prisma`
2. Run `prisma db push` from the `core/` directory
3. Copy changes to `frontend/prisma/schema.prisma` (keep generator as `prisma-client-js`)
4. Generate frontend Prisma client: `cd frontend && npx prisma generate`

### Commit Messages

Use clear, descriptive commit messages:
- `feat: Add support for Philips Hue devices`
- `fix: Resolve WebSocket reconnection issue`
- `docs: Update installation instructions`
- `refactor: Improve state machine performance`
- `test: Add unit tests for MQTT service`

## 🧪 Testing

Currently, the project does not have a comprehensive test suite. **Adding tests is highly encouraged!**

### Future Testing Goals
- Unit tests for device integrations
- Integration tests for MQTT and WebSocket services
- End-to-end tests for frontend workflows
- Hardware testing with actual smart devices

## 📝 Pull Request Process

1. **Update documentation** - Ensure README and other docs reflect your changes
2. **Test your changes** - Verify functionality with actual hardware if possible
3. **Update .env.example** - If adding new environment variables
4. **Keep commits clean** - Squash commits if necessary
5. **Create pull request** - With a clear description of changes
6. **Respond to feedback** - Address review comments promptly

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Checklist
- [ ] Code follows project style guidelines
- [ ] Documentation updated
- [ ] No hardcoded credentials or sensitive data
- [ ] Tested with actual hardware (if applicable)
```

## 🐛 Reporting Bugs

When reporting bugs, please include:
- **Description** - Clear description of the bug
- **Steps to Reproduce** - Detailed steps to reproduce the issue
- **Expected Behavior** - What you expected to happen
- **Actual Behavior** - What actually happened
- **Environment** - OS, Python version, Node version, device info
- **Logs** - Relevant log output or screenshots

## 💡 Feature Requests

When suggesting features:
- Check if the feature has already been requested
- Clearly describe the feature and its use case
- Explain why this feature would be useful
- Consider implementation complexity

## 🤝 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the issue, not the person
- Help others learn and grow

## 📞 Getting Help

- **Documentation** - Check `.github/copilot-instructions.md` for architecture details
- **Issues** - Search existing issues for similar questions
- **Discussions** - Start a discussion for general questions

## 🏆 Recognition

Contributors will be recognized in the project README and release notes.

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to HomeLab! 🏠✨
