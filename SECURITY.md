# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in HomeLab, please report it responsibly:

1. **Do NOT** open a public issue
2. Send details to: [Your Email Address]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and work with you to address the issue.

## Security Best Practices

When deploying HomeLab:

### Network Security
- Run on a private network, not exposed to the internet
- Use firewall rules to restrict access
- Consider VPN for remote access instead of port forwarding

### Authentication
- Currently, HomeLab does not include authentication
- Do NOT expose the backend (port 8000) directly to the internet
- Use reverse proxy with authentication (nginx, Caddy) if remote access needed

### MQTT Security
- Configure MQTT broker with username/password authentication
- Use TLS/SSL for MQTT connections when possible
- Update `core/.env` with MQTT credentials:
  ```
  MQTT_USERNAME=your_username
  MQTT_PASSWORD=your_password
  ```

### Environment Variables
- Never commit `.env` files to version control
- Use strong, unique API keys
- Rotate credentials regularly

### Database
- SQLite database is stored locally
- Back up `core/database.db` regularly
- Set appropriate file permissions (chmod 600)

### Updates
- Keep dependencies updated regularly:
  ```bash
  cd core && pip install --upgrade -r requirements.txt
  cd frontend && npm update
  ```

## Known Limitations

1. **No Built-in Authentication** - Add reverse proxy with auth if exposing externally
2. **Local Network Only** - Designed for local network use
3. **SQLite Database** - Not recommended for high-concurrency scenarios
4. **Hardcoded Credentials** - Ensure all credentials moved to environment variables

## Security Roadmap

Future versions may include:
- [ ] User authentication and authorization
- [ ] HTTPS/TLS support
- [ ] API rate limiting
- [ ] Audit logging
- [ ] Role-based access control (RBAC)

---

Thank you for helping keep HomeLab secure!
