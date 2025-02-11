export const encoderMap = {
    '^(gpt-4o|o1|o3)': 'o200k_base',
    '^(gpt-4|gpt-3.5)': 'cl100k_base',
    '^(text-davinci-00[23]|gpt-3)': 'p50k_base',
    '(edit-001|davinci-edit)': 'p50k_edit',
    '(gpt-2|codegpt)': 'r50k_base'
}

export const defaultEncoder = "o200k_base"