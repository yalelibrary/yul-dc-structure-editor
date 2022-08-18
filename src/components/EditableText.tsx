import React, { useLayoutEffect, useRef, useState } from 'react';

class EditableTextProps {
  onSave!: ((value: string) => void);
  defaultValue!: string;
}

function EditableText({ onSave, defaultValue }: EditableTextProps) {
  const inputEl = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(defaultValue);

  useLayoutEffect(() => {
    if (editing && inputEl.current) {
      inputEl.current.select();
    }
  }, [editing])

  if (editing) {
    return <input
      className='edit-text'
      value={value}
      ref={inputEl}
      autoFocus
      onChange={(e) => setValue(e.target.value)}  // using input instead of antd Input since onBlur doesn't work on Input.
      onBlur={() => {
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