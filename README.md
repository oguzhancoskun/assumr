# Assumr

Assumr is a powerful AWS role switching tool that consists of two components:
1. A Safari extension for quick role switching
2. A CLI proxy application for advanced profile management

## Safari Extension

The Safari extension provides a quick and easy way to switch between AWS roles directly from your browser.

### Features
- Customizable keyboard shortcuts
- Context menu integration
- Persistent color-coded profiles
- Support for both manual AWS config and proxy mode
- Clean, modern UI with Bootstrap styling

### Installation
1. Download the latest `.dmg` file from the [Releases](https://github.com/oguzhancoskun/assumr/releases) page
2. Double-click to mount the disk image
3. Drag Assumr.app to your Applications folder
4. Open Safari and enable the extension in Safari Extensions preferences
5. Grant necessary permissions in System Preferences > Security & Privacy

### Usage
1. **Keyboard Shortcut**: Use the configured shortcut (default: Command+Option+K) to open the role switcher
2. **Context Menu**: Right-click anywhere on an AWS page and select "Switch AWS Role"
3. **Profile Selection**: Click on a profile to switch to that role

### Configuration
1. Open the extension settings
2. Choose between manual config or proxy mode:
   - **Manual Config**: Paste your AWS config file to import profiles
   - **Proxy Mode**: Connect to the Assumr Proxy CLI app for automatic profile management
3. Customize keyboard shortcuts
4. Configure proxy settings if using proxy mode

## Assumr Proxy CLI

The Assumr Proxy CLI is a companion application that provides advanced profile management capabilities and can automatically sync your AWS profiles.

### Installation
```bash
# Using Homebrew
brew install assumr

# Or download the binary from releases
curl -L https://github.com/oguzhancoskun/assumr/releases/latest/download/assumr-darwin-amd64 -o assumr
chmod +x assumr
sudo mv assumr /usr/local/bin/
```

### Features
- Automatic AWS profile discovery
- Real-time profile updates
- Secure token-based authentication
- Support for multiple AWS config files
- Profile validation and error checking

### Usage
```bash
# Start the proxy server
assumr proxy start

# List available profiles
assumr profiles list

# Add a new profile
assumr profiles add

# Remove a profile
assumr profiles remove <profile-name>

# Validate profiles
assumr profiles validate
```

### Configuration
The proxy can be configured using environment variables or a config file:

```yaml
# ~/.assumr/config.yaml
port: 55001
token: your-secure-token
aws_config_path: ~/.aws/config
auto_refresh: true
refresh_interval: 300  # seconds
```

## Integration

To use the Safari extension with the Assumr Proxy:

1. Install and start the Assumr Proxy CLI
2. In the Safari extension settings:
   - Enable "Proxy Mode"
   - Enter the proxy port (default: 55001)
   - Enter the authentication token from the proxy
3. Click "Test Proxy Connection" to verify the setup

## Requirements

### Safari Extension
- macOS
- Safari 15.0 or later
- AWS account with configured roles

### Assumr Proxy CLI
- macOS/Linux
- AWS CLI configured
- Go 1.16 or later (for building from source)

## Development

### Building the Extension
```bash
# Install dependencies
npm install

# Build the extension
npm run build

# Package the extension
npm run package
```

### Building the Proxy
```bash
# Clone the repository
git clone https://github.com/oguzhancoskun/assumr.git

# Build the proxy
cd assumr/proxy
go build -o assumr

# Run tests
go test ./...
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
