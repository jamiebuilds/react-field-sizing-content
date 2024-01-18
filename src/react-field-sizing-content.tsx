import {
	CSSProperties,
	ForwardedRef,
	InputHTMLAttributes,
	ReactNode,
	forwardRef,
	useLayoutEffect,
	useRef,
} from "react"

/**
 * This should be a complete list of CSS properties that affect the content
 * width of an input element.
 */
const INHERITED_PROPERTIES = [
	"font",
	"letterSpacing",
	"textTransform",
	"fontKerning",
	"fontOpticalSizing",
	"fontSizeAdjust",
	"fontStretch",
	"fontVariant",
	"fontVariationSettings",
	"fontSynthesis",
	"textIndent",
] as const satisfies Array<keyof CSSStyleDeclaration>

/**
 * Basic styles for the measurement element to ensure it doesn't affect the
 * layout of the page but we can get the `scrollWidth`
 */
const measureStyles = {
	all: "initial",
	position: "absolute",
	top: "0px",
	left: "0px",
	width: "0px",
	height: "0px",
	visibility: "hidden",
	overflow: "scroll",
	whiteSpace: "pre",
} as const satisfies CSSProperties

/**
 * Creates an invisible element to measure the width of the input element.
 */
function calculateWidth(element: HTMLInputElement) {
	let measure = document.createElement("span")
	measure.innerText = element.value === "" ? element.placeholder : element.value
	let styles = window.getComputedStyle(element)
	Object.assign(measure.style, measureStyles)
	INHERITED_PROPERTIES.forEach((property) => {
		measure.style[property] = styles[property]
	})
	document.body.appendChild(measure)
	let width = fixWidthForBoxSizing(measure.scrollWidth, styles)
	document.body.removeChild(measure)
	return width
}

/**
 * Creates a `calc()` expression for the width of the input element in a
 * box-sizing agnostic way.
 */
function fixWidthForBoxSizing(innerWidth: number, styles: CSSStyleDeclaration) {
	let width = "calc("
	width += `${innerWidth}px`
	if (styles.boxSizing === "border-box") {
		width += ` + ${styles.paddingLeft} + ${styles.paddingRight}`
		width += ` + ${styles.borderLeftWidth} + ${styles.borderRightWidth}`
	}
	width += ")"
	return width
}

/**
 * Normalize the style.width JSX value to a string value.
 */
function fixReactStyle(width: string | number | null | void) {
	return width == null ? "" : typeof width === "number" ? `${width}px` : width
}

/**
 * The `field-sizing` CSS property.
 */
export type FieldSizing = "content" | "fixed" | void

/**
 * Props for the `Input` component.
 * The normal `input` props are all supported with the addition of `fieldSizing`.
 */
export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
	fieldSizing?: FieldSizing
}

/**
 * A normal input element that acts as a ponyfill for the `field-sizing: content`
 * CSS property via a `fieldSizing` prop.
 */
export let Input = forwardRef(function Input(
	props: InputProps,
	ref: ForwardedRef<HTMLInputElement>
): ReactNode {
	let { fieldSizing, ...rest } = props
	let inputRef = useRef<HTMLInputElement | null>(null)
	useLayoutEffect(() => {
		let input = inputRef.current!
		function update() {
			if (fieldSizing !== "content") return
			input.style.width = calculateWidth(input)
		}
		update()
		// need to listen for input events in case its not a controlled component
		input.addEventListener("input", update)
		return () => {
			input.style.width = fixReactStyle(props.style?.width)
			input.removeEventListener("input", update)
		}
	}, [props.value, fieldSizing, props.style?.width])
	return (
		<input
			ref={(element) => {
				inputRef.current = element
				if (typeof ref === "function") {
					ref(element)
				} else if (ref != null) {
					ref.current = element
				}
			}}
			{...rest}
		/>
	)
})
