
/* Convert rem value to px using document font size */
export function remToPx(rem) {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}
