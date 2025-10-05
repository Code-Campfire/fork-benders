// Imports in WRONG order - should be: builtin → external → internal
// ESLint --fix will reorder these automatically
import path from 'path';

import axios from 'axios';

function fetchData(endpoint) {
    const fullPath = path.join('/api', endpoint);
    return axios.get(fullPath);
}

export default fetchData;
