import {Position, Range, TextDocument} from 'vscode-languageserver-textdocument'

export enum TokenType
{
	invalid,
	eof,
	whitespace,
	comment,
	newline,
	dot,
	ellipsis,
	semi,
	ident,
	leftParen,
	rightParen,
	leftBrace,
	rightBrace,
	leftSquare,
	rightSquare,
	comma,
	colon,
	binLit,
	octLit,
	hexLit,
	intLit,
	stringLit,
	charLit,
	boolLit,
	nullptrLit,
	invert,
	incOp,
	mulOp,
	addOp,
	shiftOp,
	bitOp,
	relOp,
	equOp,
	logicOp,

	locationSpec,
	storageSpec,
	type,
	assignOp,

	fromStmt,
	importStmt,
	asStmt,
	newStmt,
	deleteStmt,
	returnStmt,
	ifStmt,
	elifStmt,
	elseStmt,
	forStmt,
	whileStmt,
	doStmt,

	noneType,
	arrow,
	classDef,
	enumDef,
	functionDef,
	operatorDef,
	decorator,
	visibility,
	unsafe,

	// XXX: These only exist because of the current parser structure and aren't real tokens.
	float32Lit,
	float64Lit
}

function isPositionEqual(posA: Position, posB: Position)
{
	return posA.line === posB.line &&
		posA.character === posB.character
}

function isRangeEqual(rangeA: Range, rangeB: Range)
{
	return isPositionEqual(rangeA.start, rangeB.start) &&
		isPositionEqual(rangeA.end, rangeB.end)
}

export class Token
{
	private _type: TokenType = TokenType.invalid
	private _value = ''
	private _location: Range = {start: {line: -1, character: -1}, end: {line: -1, character: -1}}
	private _length = 0

	constructor(token?: Token)
	{
		if (token)
			this.update(token)
	}

	get type()
	{
		return this._type
	}

	get value()
	{
		return this._value
	}

	set value(value: string)
	{
		this._value = value
	}

	get location()
	{
		return this._location
	}

	get length()
	{
		return this._length
	}

	get valid()
	{
		return this._type !== TokenType.invalid
	}

	public set(type: TokenType, value?: string)
	{
		this._type = type
		this._value = value ?? ''
	}

	public reset()
	{
		this._type = TokenType.invalid
		this._value = ''
		this._location.start = this._location.end
		this._length = 0
	}

	public beginsAt(position: Position)
	{
		this._location.start = position
	}

	public endsAt(position: Position)
	{
		this._location.end = position
	}

	public calcLength(file: TextDocument)
	{
		const beginOffset = file.offsetAt(this._location.start)
		const endOffset = file.offsetAt(this._location.end)
		this._length = endOffset - beginOffset
	}

	public typeIsOneOf(...types: TokenType[])
	{
		return types.some(type => this._type === type, this)
	}

	public clone() { return new Token(this) }

	/* Update the object without invaliding reference to the existing object */
	public update(token: Token)
	{
		this._type = token._type
		this._value = token._value
		this._location =
		{
			start:
			{
				line: token._location.start.line,
				character: token._location.start.character
			},
			end:
			{
				line: token._location.end.line,
				character: token._location.end.character
			}
		}
		this._length = token._length
	}

	public toString()
	{
		// The token location has 1 added to both the character and line because internally they're base-0
		// but in the file itself they're base-1.
		const start = this.location.start
		return `<Token ${this._type}@${start.line + 1}:${start.character + 1} -> ${this._value}>`
	}

	public isEqual(token: Token)
	{
		return this._type === token._type &&
			this._value === token._value &&
			isRangeEqual(this._location, token._location) &&
			this._length === token._length
	}
}
