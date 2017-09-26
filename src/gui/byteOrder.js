import { littleEndian } from '../float'

document.getElementById('byte-order').innerHTML = `${littleEndian ? 'little' : 'big'} endian`
