/**
 * Scroll to a section by id.
 *
 * Plain anchor links break on the sheet stack: a pinned (sticky) section is
 * often already stuck at the top of the viewport while another sheet covers
 * it, so the browser sees nothing to scroll to. This resolves each target to
 * its layout position instead, walking offsetTop (which ignores sticky offsets
 * and transforms) and using the pinning wrapper for sticky sections.
 *
 * A section may mark one descendant with `data-nav-focus`. When that block fits
 * in the viewport it is centred, so short sections land with all of their
 * content in view rather than their top padding; the scroll never goes above
 * the section's own top, so the sheet underneath stays covered.
 */
export function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (!el) return;

    const box = getComputedStyle(el).position === "sticky" && el.parentElement ? el.parentElement : el;
    let top = layoutTop(box);

    const focus = el.querySelector<HTMLElement>("[data-nav-focus]");
    if (focus && focus.offsetHeight < window.innerHeight) {
        top = Math.max(top, layoutTop(focus) - (window.innerHeight - focus.offsetHeight) / 2);
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
    history.replaceState(null, "", `#${id}`);
}

/** Document position of an element's layout box. */
function layoutTop(el: HTMLElement) {
    let top = 0;
    for (let node: HTMLElement | null = el; node; node = node.offsetParent as HTMLElement | null) {
        top += node.offsetTop;
    }
    return top;
}
