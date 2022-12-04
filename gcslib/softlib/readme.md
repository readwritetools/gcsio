












<figure>
	<img src='/img/libs/softlib/softlib-ono-kosuki-5647228.png' width='100%' />
	<figcaption></figcaption>
</figure>

##### Contract by Design

# Softlib

## Runtime code safety and sanity checking


<address>
<img src='/img/48x48/rwtools.png' /> by <a href='https://readwritetools.com' title='Read Write Tools'>Read Write Tools</a> <time datetime=2015-09-13>Sep 13, 2015</time></address>



<table>
	<tr><th>Abstract</th></tr>
	<tr><td>The <span class=product>softlib</span> JavaScript library has functions for type expectations, soft assertions, and logging to the terminal with stack trace.</td></tr>
</table>

### Motivation

Before typescript came on the scene this library was a good way to reliably
verify that function inputs were in their expected form. It continues to be an
essential library for software written in pure ECMAScript.

### Features

The `expect` function provides runtime type safety without the overhead of a
precompiler. It provides a strong measure of safety during execution by
providing an early warning system when things aren't proceeding as expected.

The `aver` function is a soft assertion. When conditions should be true, an `aver()`
can alert the developer that things haven't lived up to their promise. This is
done in a non-fatal way, allowing the condition to persist (even when the aver
fails) letting the code deal with the condition using whatever coding paradigm
is in force, such as a try/finally block or other exception/error handling
techniques.

The `terminal` function provides context sensitive logging. When reached via a
browser, output is routed to the console as a warn() or error(). When reached
via a node.js process, output is routed to stdout or stderr.

The `vartype` function provides dynamic introspection of a variable's current
type. It goes beyond ECMAScript's native `typeof` and `instanceof` keywords by
inspecting the name of the variable's constructor.

The `StackTrace` class provides a stack trace for the other functions.

### Installation

The <span>softlib</span> library may be installed directly from github or via
NPM.

To add the library to a node.js project, use this command:

```bash
[user@host]# npm install softlib

import {expect} from 'softlib';    
import {aver} from 'softlib';    
import {terminal} from 'softlib';    
import {vartype} from 'softlib';    
```

To add the library to a browser project, use this command:

```bash
[user@host]# git clone https://github.com/readwritetools/softlib.git

import {expect} from '/softlib/expect.js';    
import {aver} from '/softlib/aver.js';    
import {terminal} from '/softlib/terminal.js';    
import {vartype} from '/softlib/vartype.js';    
```

### Metadata

#### Module exports


<table>
	<tr><td>ES modules</td> 		<td>true</td></tr>
	<tr><td>Common JS</td> 		<td>false</td></tr>
</table>

#### Suitability


<table>
	<tr><td>Browser</td> 			<td>API</td></tr>
	<tr><td>node.js</td> 			<td>API</td></tr>
</table>

#### Availability


<table>
	<tr><td><img src='/img/48x48/read-write-hub.png' alt='Read Write Hub logo' width=48 /></td>	<td>Documentation</td> 		<td><a href='https://hub.readwritetools.com/libs/softlib.blue'>Read Write Hub</a></td></tr>
	<tr><td><img src='/img/48x48/git.png' alt='git logo' width=48 /></td>	<td>Source code</td> 			<td><a href='https://github.com/readwritetools/softlib'>github</a></td></tr>
	<tr><td><img src='/img/48x48/npm.png' alt='npm logo' width=48 /></td>	<td>Package installation</td> <td><a href='https://www.npmjs.com/package/softlib'>npm</a></td></tr>
</table>

#### License

The <span>softlib</span> library is licensed under the MIT License.

<img src='/img/blue-seal-mit.png' width=80 align=right />

<details>
	<summary>MIT License</summary>
	<p>Copyright © 2022 Read Write Tools.</p>
	<p>Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:</p>
	<p>The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.</p>
	<p>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.</p>
</details>

