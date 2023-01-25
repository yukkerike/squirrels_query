//  Module:     InfoParser
//  Project:    sq-lib
//  Author:     soviet
//  E-mail:     soviet@s0viet.ru
//  Web:        https://s0viet.ru/

class InfoParser {
	constructor(signatures) {
		this.signatures = signatures
	}
	convertMaskArray(mask) {
		let array = []
		for(let sig of this.signatures)
			if(sig.name)
				if(!!(mask & sig.mask) || sig.mask === 0)
					array.push(sig.name)
		return array
	}
	convertArrayMask(array) {
		let mask = 0
		for(let sig of this.signatures)
			if(array.indexOf(sig.name) !== -1)
				mask = mask | sig.mask
		return mask
	}
	readVal(type, buffer, offset) {
		if(typeof type === 'object') {
			if(type[0] === 'array') {
				let {value, size} = InfoParser.primitives.readCtx[type[1].countType](buffer, offset)
				let bytesRead = size
				let array = new Array(value)
				for(let i = 0; i < array.length; i++) {
					let {value, size} = this.readVal(type[1].type, buffer, offset + bytesRead)
					array[i] = value
					bytesRead += size
				}
				return {
					value: array,
					size: bytesRead
				}
			}
			else if(type[0] == 'container')
			{
				let bytesRead = 0
				let container = new Object(null)
				for(let elem of type[1]) {
					let {value, size} = this.readVal(elem.type, buffer, offset + bytesRead)
					container[elem.name] = value
					bytesRead += size
				}
				return {
					value: container,
					size: bytesRead
				}
			}
		}
		return InfoParser.primitives.readCtx[type](buffer, offset)
	}
	writeVal(type, value, buffer, offset) {
		if(typeof type === 'object') {
			if(type[0] === 'array') {
				offset = this.writeVal(type[1].countType, value.length, buffer, offset)
				for(let elem of value)
					offset = this.writeVal(type[1].type, elem, buffer, offset)
				return offset
			}
			else if(type[0] === 'container')
			{
				for(let elem of type[1])
					offset = this.writeVal(elem.type, value[elem.name], buffer, offset)
				return offset
			}
		}
		return InfoParser.primitives.writeCtx[type](value, buffer, offset)
	}
	sizeOfVal(type, value) {
		if(typeof type === 'object') {
			if(type[0] === 'array') {
				let size = this.sizeOfVal(type[1].countType, value.length)
				for(let elem of value)
					size += this.sizeOfVal(type[1].type, elem)
				return size
			}
			else if(type[0] === 'container')
			{
				let size = 0
				for(let elem of type[1])
					size += this.sizeOfVal(elem.type, value[elem.name])
				return size
			}
		}
		return InfoParser.primitives.sizeOfCtx[type](value)
	}
	read(buffer, mask) {
		if(typeof mask === 'number')
			mask = this.convertMaskArray(mask)
		let {value, size} = this.readVal("UInt", buffer, 0)
		let offset = size
		let array = new Array(value)
		for(let i = 0; i < value; i++) {
			let data = new Object(null)
			for(let sig of this.signatures) {
				if(mask.indexOf(sig.name) !== -1) {
					let {value, size} = this.readVal(sig.signature, buffer, offset)
					offset += size
					data[sig.name] = value
				}
			}
			array[i] = data
		}
		return array
	}
	write(array) {
		let buffer = Buffer.allocUnsafe(this.sizeOf(array))
		let offset = this.writeVal("UInt", array.length, buffer, 0)
		for(let elem of array)
			for(let sig of this.signatures)
				if(elem[sig.name] !== undefined)
					offset = this.writeVal(sig.signature, elem[sig.name], buffer, offset)
		return buffer
	}
	sizeOf(array) {
		let size = 0
		size += this.sizeOfVal("UInt", array.length)
		for(let elem of array)
			for(let sig of this.signatures)
				if(elem[sig.name] !== undefined)
					size += this.sizeOfVal(sig.signature, elem[sig.name])
		return size
	}
}

module.exports = {
	InfoParser: InfoParser
}