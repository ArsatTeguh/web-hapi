const ClientError = require('../../Excption/clientError');

class NotesHandler {
  constructor(service, validator) {
    this._Service = service;
    this._Validator = validator;
    this.postNoteHandler = this.postNoteHandler.bind(this);
    this.getNotesHandler = this.getNotesHandler.bind(this);
    this.getNoteByIdHandler = this.getNoteByIdHandler.bind(this);
    this.putNoteByIdHandler = this.putNoteByIdHandler.bind(this);
    this.deleteNoteByIdHandler = this.deleteNoteByIdHandler.bind(this);
  }

  async postNoteHandler(request, h) {
    try {
      this._Validator.validateNotePayload(request.payload);
      const { title = 'untitled', body, tags } = request.payload;


      // mettod addnote mengembalikan id
      const { id: credentialId } = request.auth.credentials;
      const noteId = await this._Service.addNote({
        title, body, tags, owner: credentialId,
      });

      const response = h.response({
        status: 'success',
        message: 'Catatan berhasil ditambahkan',
        data: {
          noteId,
        },
      });
      response.code(201);
      return response;
    } catch (e) {
      if (e instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: e.message,
        });
        response.code(e.statusCode);
        return response;
      }

      // Handle Server Error
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(e);
      return response;
    }
  }

  async getNotesHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const notes = await this._Service.getNotes(credentialId);
    try {
      const response = h.response({
        status: 'success',
        data: {
          notes,
        },
      });
      response.code(200);
      return response;
    } catch (error) {
      const responses = h.response({
        status: 'fail',
        message: error.message,
      });
      responses.code(400);
      return responses;
    }
  }

 async getNoteByIdHandler(request, h) {
    try {
      const { id: credentialId } = request.auth.credentials;
      const { id } = request.params;
    
      await this._Service.verifyNoteOwner(id, credentialId);
      const note = await this._Service.getNoteById(id);
      return {
        status: 'success',
        data: {
          note,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Handling Server Error
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async putNoteByIdHandler(request, h) {
    try {
      this._Validator.validateNotePayload(request.payload);
      const { id: credentialId} = request.auth.credentials;
      const { id } = request.params;
      await this._Service.verifyNoteOwner(id, credentialId);
      await this._Service.editNoteById(id, request.payload);

      return {
        status: 'success',
        message: 'Catatan berhasil diperbarui',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Hendling Server Error
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async deleteNoteByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;
      await this._Service.verifyNoteOwner(id, credentialId);
      await this._Service.deleteNoteById(id);
      return {
        status: 'success',
        message: 'Catatan berhasil dihapus',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Hendling Server Error
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = NotesHandler;