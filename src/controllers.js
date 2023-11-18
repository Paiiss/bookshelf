const { nanoid } = require('nanoid');
const bookself = require('./bookself');

class Controller {
  create(request, h) {
    try {
      const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;
      if (!name) throw { errCode: 400, errStatus: 'fail', message: 'Gagal menambahkan buku. Mohon isi nama buku' };
      if (readPage > pageCount)
        throw {
          errCode: 400,
          errStatus: 'fail',
          message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
        };

      const id = nanoid(16);
      const createdTime = new Date().toISOString();

      bookself.push({
        id,
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        finished: pageCount === readPage,
        reading,
        insertedAt: createdTime,
        updatedAt: createdTime,
      });

      return h
        .response({ status: 'success', message: 'Buku berhasil ditambahkan', data: { bookId: nanoid(16) } })
        .code(201);
    } catch (error) {
      return h
        .response({
          status: error.errStatus || 'fail',
          message: error.message || 'Server error',
        })
        .code(error.errCode || 500);
    }
  }

  store(request, h) {
    try {
      const { name, reading, finished } = request.query;
      let book = bookself;
      if (name) book = book.filter((x) => x.name.toLowerCase().includes(name.toLowerCase()));
      if (reading) book = book.filter((x) => x.reading === !!Number(reading));
      if (finished) book = book.filter((x) => x.finished === !!Number(finished));
      return h
        .response({
          status: 'success',
          data: {
            books: book.map((x) => ({
              id: x.id,
              name: x.name,
              publisher: x.publisher,
            })),
          },
        })
        .code(200);
    } catch (error) {
      return h
        .response({
          status: error.errStatus || 'fail',
          message: error.message || 'Server error',
        })
        .code(error.errCode || 500);
    }
  }

  index(request, h) {
    try {
      const { bookId } = request.params;
      const book = bookself.filter((x) => x.id === bookId)[0];
      if (!bookId || !book) throw { errCode: 404, errStatus: 'fail', message: 'Buku tidak ditemukan' };
      return h.response({ status: 'success', data: { book } }).code(200);
    } catch (error) {
      return h
        .response({
          status: error.errStatus || 'fail',
          message: error.message || 'Server error',
        })
        .code(error.errCode || 500);
    }
  }

  update(request, h) {
    try {
      const { bookId } = request.params;
      if (!bookId) throw { errCode: 404, errStatus: 'fail', message: 'Gagal memperbarui buku. Id tidak ditemukan' };

      const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;
      if (!name) throw { errCode: 400, errStatus: 'fail', message: 'Gagal memperbarui buku. Mohon isi nama buku' };
      if (readPage > pageCount)
        throw {
          errCode: 400,
          errStatus: 'fail',
          message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
        };

      const updatedTime = new Date().toISOString();
      const index = bookself.findIndex((x) => x.id === bookId);
      if (index === -1)
        throw { errCode: 404, errStatus: 'fail', message: 'Gagal memperbarui buku. Id tidak ditemukan' };
      bookself[index] = {
        ...bookself[index],
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        finished: pageCount === readPage,
        reading,
        updatedAt: updatedTime,
      };

      return h.response({ status: 'success', message: 'Buku berhasil diperbarui' }).code(200);
    } catch (error) {
      return h
        .response({
          status: error.errStatus || 'fail',
          message: error.message || 'Server error',
        })
        .code(error.errCode || 500);
    }
  }

  delete(request, h) {
    try {
      const { bookId } = request.params;
      if (!bookId) throw { errCode: 404, errStatus: 'fail', message: 'Buku gagal dihapus. Id tidak ditemukan' };
      const index = bookself.findIndex((x) => x.id === bookId);
      if (index === -1) throw { errCode: 404, errStatus: 'fail', message: 'Buku gagal dihapus. Id tidak ditemukan' };
      bookself.splice(index, 1);
      return h.response({ status: 'success', message: 'Buku berhasil dihapus' }).code(200);
    } catch (error) {
      return h
        .response({
          status: error.errStatus || 'fail',
          message: error.message || 'Server error',
        })
        .code(error.errCode || 500);
    }
  }
}

module.exports = new Controller();
