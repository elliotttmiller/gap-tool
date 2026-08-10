# Client Profile Import and Export

The Client Setup dashboard can import or export advisor-entered client profile inputs without replacing existing application data.

## Advisor workflow

1. Select **Import Clients** and choose a Gap Tool client-profile JSON file.
2. Review the detected client names and any possible existing-name matches.
3. Confirm the import. Each profile is assigned a new internal ID and becomes available for risk-review generation.
4. Use **Export All** for all active client profiles, or the download action beside one client to export only that profile.

Exports contain client setup inputs only. They do not contain calculated outputs, scenario notes, advisor assumptions, archived clients, or internal ownership identifiers.

## File contract

- `kind`: `gap-tool-client-profiles`
- `schemaVersion`: `1`
- `clients`: one to 500 client setup records
- Percentages use decimals (`0.60` means 60%).
- Currency and income values use annual or monthly units exactly as named by each field.
- Current age and projection end age use whole years, and projection end age must be greater than current age.
- Negative, non-finite, malformed, or unsupported values are rejected before any client is created.

The fictional, import-ready validation profile is available at `examples/realistic-client-profile-import.json`.
