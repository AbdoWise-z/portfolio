/**
 * Scroll to a section by id.
 *
 * Plain anchor links break on the sheet stack: a pinned (sticky) section is
 * often already stuck at the top of the viewport while another sheet covers
 * it, so the browser sees nothing to scroll to. This resolves each target to
 * its layout position instead, walking offsetTop (which ignores sticky offsets
 * and transforms) and using the pinning wrapper for sticky sections.
 */
export function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (!el) return;

    const box = getComputedStyle(el).position === "sticky" && el.parentElement ? el.parentElement : el;
    let top = 0;
    for (let node: HTMLElement | null = box; node; node = node.offsetParent as HTMLElement | null) {
        top += node.offsetTop;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
    history.replaceState(null, "", `#${id}`);
}
