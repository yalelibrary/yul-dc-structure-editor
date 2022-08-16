import React, { useState } from 'react';

class EditableTextProps {
  onSave!: ((value: string) => void);
  defaultValue!: string;
}

function EditableText({ onSave, defaultValue }: EditableTextProps) {

  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(defaultValue);
  if (editing) {
    return <input
      className='edit-text'
      value={value}
      autoFocus
      onChange={(e) => setValue(e.target.value)}  // using input instead of antd Input since onBlur doesn't work on Input.
      onBlur={() => {
        console.log("ONBLUR");
        setEditing(false);
        onSave(value);
      }} onKeyDown={(e) => {
        if (e.key === 'Enter') {
          setEditing(false);
          onSave(value);
          e.preventDefault();
          e.stopPropagation();
        } else if (e.key === 'Escape') {
          setEditing(false);
          setValue(defaultValue);
          e.preventDefault();
          e.stopPropagation();
        }
      }} />
  } else {
    return <span onDoubleClick={(e) => { setEditing(true) }}>{value}</span>
  }

}

export default EditableText;