import { ChangeEvent, useState } from "react"
import { Input } from "../../src/react-field-sizing-content"

export default function App() {
	let [value, setValue] = useState("")
	function handleChange(event: ChangeEvent<HTMLInputElement>) {
		setValue(event.target.value)
	}
	return (
		<>
			<p>A basic input</p>
			<Input fieldSizing="content" value={value} onChange={handleChange} />
			<p>
				Customized borders, padding, font styles, box sizing, min/max width with
				parent styles that we're isolated from
			</p>
			<div style={{ fontSize: 100 }}>
				Parent
				<Input
					fieldSizing="content"
					placeholder="placeholder"
					value={value}
					onChange={handleChange}
					style={{
						padding: 20,
						border: "10px solid red",
						fontFamily: "monospace",
						letterSpacing: "10px",
						boxSizing: "border-box",
						minWidth: 50,
						maxWidth: 400,
						textIndent: 20,
					}}
				/>
			</div>
		</>
	)
}
