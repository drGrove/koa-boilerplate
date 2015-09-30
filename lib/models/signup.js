/**
 *  @swagger
 *  definition:
 *    SignUp:
 *      type: object
 *      required:
 *        - firstname
 *        - lastname
 *        - email
 *        - password
 *      properties:
 *        firstname:
 *          type: string
 *        lastname:
 *          type: string
 *        email:
 *          type: string
 *          format: email
 *        password:
 *          type: string
 *          format: password
 */
