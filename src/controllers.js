const { nanoid } = require('nanoid');
const bookshelf = require('./bookshelf');

const createHttpError = (statusCode, status, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.status = status;
  return error;
};

class Controller {
  create(request, h) {
    try {
      const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
      } = request.payload;

      if (!name) {
        throw createHttpError(
          400,
          'fail',
          'Gagal menambahkan buku. Mohon isi nama buku',
        );
      }

      if (readPage > pageCount) {
        throw createHttpError(
          400,
          'fail',
          'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
        );
      }

      const id = nanoid(16);
      const createdTime = new Date().toISOString();

      bookshelf.push({
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

      const isPersisted = bookshelf.some((x) => x.id === id);
      if (!isPersisted) {
        throw createHttpError(500, 'fail', 'Buku gagal ditambahkan');
      }

      return h
        .response({
          status: 'success',
          message: 'Buku berhasil ditambahkan',
          data: {
            bookId: id,
          },
        })
        .code(201);
    } catch (error) {
      return h
        .response({
          status: error.status || 'fail',
          message: error.message || 'Server error',
        })
        .code(error.statusCode || 500);
    }
  }

  store(request, h) {
    try {
      const { name, reading, finished } = request.query;
      let book = bookshelf;

      if (name !== undefined) {
        const lowered = name.toLowerCase();
        book = book.filter((x) => x.name.toLowerCase().includes(lowered));
      }

      if (reading !== undefined) {
        const isReading = Number(reading) === 1;
        book = book.filter((x) => x.reading === isReading);
      }

      if (finished !== undefined) {
        const isFinished = Number(finished) === 1;
        book = book.filter((x) => x.finished === isFinished);
      }
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
          status: error.status || 'fail',
          message: error.message || 'Server error',
        })
        .code(error.statusCode || 500);
    }
  }

  index(request, h) {
    try {
      const { bookId } = request.params;
      const book = bookshelf.find((x) => x.id === bookId);

      if (!book) {
        throw createHttpError(404, 'fail', 'Buku tidak ditemukan');
      }

      return h
        .response({
          status: 'success',
          data: {
            book,
          },
        })
        .code(200);
    } catch (error) {
      return h
        .response({
          status: error.status || 'fail',
          message: error.message || 'Server error',
        })
        .code(error.statusCode || 500);
    }
  }

  update(request, h) {
    try {
      const { bookId } = request.params;

      const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
      } = request.payload;

      if (!name) {
        throw createHttpError(
          400,
          'fail',
          'Gagal memperbarui buku. Mohon isi nama buku',
        );
      }

      if (readPage > pageCount) {
        throw createHttpError(
          400,
          'fail',
          'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
        );
      }

      const updatedTime = new Date().toISOString();
      const index = bookshelf.findIndex((x) => x.id === bookId);

      if (index === -1) {
        throw createHttpError(
          404,
          'fail',
          'Gagal memperbarui buku. Id tidak ditemukan',
        );
      }

      bookshelf[index] = {
        ...bookshelf[index],
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

      return h
        .response({
          status: 'success',
          message: 'Buku berhasil diperbarui',
        })
        .code(200);
    } catch (error) {
      return h
        .response({
          status: error.status || 'fail',
          message: error.message || 'Server error',
        })
        .code(error.statusCode || 500);
    }
  }

  delete(request, h) {
    try {
      const { bookId } = request.params;
      const index = bookshelf.findIndex((x) => x.id === bookId);

      if (index === -1) {
        throw createHttpError(
          404,
          'fail',
          'Buku gagal dihapus. Id tidak ditemukan',
        );
      }

      bookshelf.splice(index, 1);
      return h
        .response({
          status: 'success',
          message: 'Buku berhasil dihapus',
        })
        .code(200);
    } catch (error) {
      return h
        .response({
          status: error.status || 'fail',
          message: error.message || 'Server error',
        })
        .code(error.statusCode || 500);
    }
  }
}

module.exports = new Controller();
